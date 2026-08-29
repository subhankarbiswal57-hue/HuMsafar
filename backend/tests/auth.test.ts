import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/prisma";

const app = createApp();
const testEmail = `test_${Date.now()}@example.com`;

describe("health check", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("auth flow", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: "SecurePass123",
      firstName: "Test",
      lastName: "User",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testEmail);
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: "SecurePass123",
      firstName: "Test",
      lastName: "User",
    });
    expect(res.status).toBe(409);
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "WrongPassword",
    });
    expect(res.status).toBe(401);
  });

  it("blocks protected route without token", async () => {
    const res = await request(app).get("/api/roads");
    expect(res.status).toBe(401);
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});
