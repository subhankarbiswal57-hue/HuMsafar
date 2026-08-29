import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";

interface ListParams {
  page: number;
  limit: number;
  roadId?: string;
  bridgeId?: string;
}

export async function listInspections({ page, limit, roadId, bridgeId }: ListParams) {
  const where: any = {};
  if (roadId) where.roadId = roadId;
  if (bridgeId) where.bridgeId = bridgeId;

  const [items, total] = await Promise.all([
    prisma.inspection.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { inspectedAt: "desc" },
      include: {
        inspector: { select: { firstName: true, lastName: true } },
        road: { select: { name: true, code: true } },
        bridge: { select: { name: true, code: true } },
      },
    }),
    prisma.inspection.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

const CONDITION_SCORE: Record<string, number> = {
  EXCELLENT: 95,
  GOOD: 80,
  FAIR: 60,
  POOR: 35,
  CRITICAL: 10,
};

export async function createInspection(
  data: { notes?: string; conditionAtInspection: string; roadId?: string; bridgeId?: string; inspectedAt?: Date },
  photoUrls: string[],
  inspectorId?: string
) {
  if (data.roadId) {
    const road = await prisma.road.findUnique({ where: { id: data.roadId } });
    if (!road) throw new ApiError(404, "Road not found");
  }
  if (data.bridgeId) {
    const bridge = await prisma.bridge.findUnique({ where: { id: data.bridgeId } });
    if (!bridge) throw new ApiError(404, "Bridge not found");
  }

  const inspection = await prisma.inspection.create({
    data: { ...data, photoUrls, inspectorId, conditionAtInspection: data.conditionAtInspection as any },
  });

  // Sync the parent asset's current condition + last-inspected date to reflect this inspection.
  const score = CONDITION_SCORE[data.conditionAtInspection] ?? 50;
  if (data.roadId) {
    await prisma.road.update({
      where: { id: data.roadId },
      data: { condition: data.conditionAtInspection as any, conditionScore: score, lastInspected: inspection.inspectedAt },
    });
  }
  if (data.bridgeId) {
    await prisma.bridge.update({
      where: { id: data.bridgeId },
      data: { condition: data.conditionAtInspection as any, conditionScore: score, lastInspected: inspection.inspectedAt },
    });
  }

  return inspection;
}
