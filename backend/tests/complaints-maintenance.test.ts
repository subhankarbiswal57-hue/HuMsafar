import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/prisma";

const app = createApp();
const citizenEmail = `citizen_${Date.now()}@example.com`;
const staffEmail = `staff_${Date.now()}@example.com`;
let citizenToken: string;
let staffToken: string;
let complaintId: string;

beforeAll(async () => {
  await request(app).post("/api/auth/register").send({
    email: citizenEmail,
    password: "SecurePass123",
    firstName: "Cit",
    lastName: "Izen",
  });
  const citizenLogin = await request(app).post("/api/auth/login").send({ email: citizenEmail, password: "SecurePass123" });
  citizenToken = citizenLogin.body.accessToken;

  await prisma.user.create({
    data: {
      email: staffEmail,
      passwordHash: (await import("bcryptjs")).default.hashSync("SecurePass123", 10),
      firstName: "Staff",
      lastName: "Engineer",
      role: "ENGINEER",
      isEmailVerified: true,
    },
  });
  const staffLogin = await request(app).post("/api/auth/login").send({ email: staffEmail, password: "SecurePass123" });
  staffToken = staffLogin.body.accessToken;
});

describe("citizen complaint flow", () => {
  it("citizen can submit a complaint", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${citizenToken}`)
      .field("title", "Pothole on Main St")
      .field("description", "Deep pothole causing damage to vehicles")
      .field("category", "POTHOLE")
      .field("latitude", "13.08")
      .field("longitude", "80.27");
    expect(res.status).toBe(201);
    expect(res.body.complaint.status).toBe("SUBMITTED");
    complaintId = res.body.complaint.id;
  });

  it("citizen can see their own complaint", async () => {
    const res = await request(app).get(`/api/complaints/${complaintId}`).set("Authorization", `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
  });

  it("citizen cannot update complaint status", async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ status: "RESOLVED" });
    expect(res.status).toBe(403);
  });

  it("staff can update complaint status", async () => {
    const res = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ status: "ACKNOWLEDGED", resolutionNotes: "Inspection scheduled" });
    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe("ACKNOWLEDGED");
  });
});

describe("maintenance module", () => {
  let roadId: string;

  it("staff creates a road to attach maintenance to", async () => {
    const res = await request(app)
      .post("/api/roads")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        code: `RD-TEST-${Date.now()}`,
        name: "Test Road",
        lengthKm: 1.5,
        geometry: { type: "LineString", coordinates: [[80.2, 13.0], [80.21, 13.01]] },
      });
    expect(res.status).toBe(201);
    roadId = res.body.item.id;
  });

  it("creates a maintenance record for that road", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ title: "Pothole patching", costEstimate: 5000, roadId });
    expect(res.status).toBe(201);
    expect(res.body.item.status).toBe("PLANNED");
  });

  it("rejects a maintenance record with no linked asset", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ title: "Invalid record" });
    expect(res.status).toBe(400);
  });

  it("citizen cannot create maintenance records", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${citizenToken}`)
      .send({ title: "Should fail", roadId });
    expect(res.status).toBe(403);
  });
});

afterAll(async () => {
  await prisma.complaint.deleteMany({ where: { reporterId: { in: await prisma.user.findMany({ where: { email: { in: [citizenEmail, staffEmail] } } }).then((u) => u.map((x) => x.id)) } } });
  await prisma.user.deleteMany({ where: { email: { in: [citizenEmail, staffEmail] } } });
  await prisma.$disconnect();
});
