import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Passw0rd!123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@infra-platform.local" },
    update: {},
    create: {
      email: "admin@infra-platform.local",
      passwordHash,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  const planner = await prisma.user.upsert({
    where: { email: "planner@infra-platform.local" },
    update: {},
    create: {
      email: "planner@infra-platform.local",
      passwordHash,
      firstName: "Urban",
      lastName: "Planner",
      role: "PLANNER",
      isEmailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "citizen@infra-platform.local" },
    update: {},
    create: {
      email: "citizen@infra-platform.local",
      passwordHash,
      firstName: "Jane",
      lastName: "Citizen",
      role: "CITIZEN",
      isEmailVerified: true,
    },
  });

  const road1 = await prisma.road.upsert({
    where: { code: "RD-001" },
    update: {},
    create: {
      code: "RD-001",
      name: "MG Road",
      description: "Primary arterial road connecting downtown to the industrial zone.",
      surfaceType: "ASPHALT",
      lengthKm: 4.2,
      widthM: 12,
      lanes: 4,
      condition: "GOOD",
      conditionScore: 78,
      yearBuilt: 2005,
      lastInspected: new Date("2025-03-15"),
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2707, 13.0827],
          [80.28, 13.09],
          [80.29, 13.095],
        ],
      },
      createdById: planner.id,
    },
  });

  const road2 = await prisma.road.upsert({
    where: { code: "RD-002" },
    update: {},
    create: {
      code: "RD-002",
      name: "Old Coastal Highway",
      description: "Flood-prone coastal corridor requiring resilience upgrades.",
      surfaceType: "ASPHALT",
      lengthKm: 9.8,
      widthM: 10,
      lanes: 2,
      condition: "POOR",
      conditionScore: 42,
      yearBuilt: 1998,
      lastInspected: new Date("2025-01-10"),
      geometry: {
        type: "LineString",
        coordinates: [
          [80.25, 13.05],
          [80.24, 13.06],
          [80.23, 13.08],
        ],
      },
      createdById: planner.id,
    },
  });

  const bridge1 = await prisma.bridge.upsert({
    where: { code: "BR-001" },
    update: {},
    create: {
      code: "BR-001",
      name: "River Crossing Bridge",
      spanLengthM: 220,
      widthM: 14,
      material: "Reinforced Concrete",
      condition: "FAIR",
      conditionScore: 61,
      yearBuilt: 1988,
      loadCapacityT: 40,
      lastInspected: new Date("2024-11-02"),
      latitude: 13.083,
      longitude: 80.275,
      createdById: planner.id,
    },
  });

  await prisma.transitAsset.upsert({
    where: { code: "TR-001" },
    update: {},
    create: {
      code: "TR-001",
      name: "Central Bus Terminal",
      type: "BUS_STOP",
      condition: "GOOD",
      latitude: 13.0827,
      longitude: 80.2707,
      createdById: planner.id,
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      title: "Resurfacing - Old Coastal Highway",
      description: "Full resurfacing due to flood damage and pothole formation.",
      status: "PLANNED",
      costEstimate: 185000,
      scheduledDate: new Date("2026-10-01"),
      roadId: road2.id,
    },
  });

  await prisma.inspection.create({
    data: {
      inspectorId: planner.id,
      notes: "Surface cracking observed near km 3.2; drainage inadequate.",
      conditionAtInspection: "POOR",
      photoUrls: [],
      roadId: road2.id,
    },
  });

  await prisma.inspection.create({
    data: {
      inspectorId: planner.id,
      notes: "Minor corrosion on support beams; no structural risk yet.",
      conditionAtInspection: "FAIR",
      photoUrls: [],
      bridgeId: bridge1.id,
    },
  });

  const citizen = await prisma.user.findUnique({ where: { email: "citizen@infra-platform.local" } });
  await prisma.complaint.create({
    data: {
      title: "Large pothole near MG Road junction",
      description: "Deep pothole causing traffic to swerve, especially dangerous at night.",
      category: "POTHOLE",
      status: "SUBMITTED",
      latitude: 13.0831,
      longitude: 80.271,
      photoUrls: [],
      reporterId: citizen?.id,
    },
  });

  console.log("Seed complete:", { admin: admin.email, roads: [road1.code, road2.code], bridges: [bridge1.code] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
