import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";

interface ListParams {
  page: number;
  limit: number;
  status?: string;
  roadId?: string;
  bridgeId?: string;
  transitId?: string;
}

const includeAssets = {
  road: { select: { name: true, code: true } },
  bridge: { select: { name: true, code: true } },
  transit: { select: { name: true, code: true } },
};

export async function listMaintenance({ page, limit, status, roadId, bridgeId, transitId }: ListParams) {
  const where: any = {};
  if (status) where.status = status;
  if (roadId) where.roadId = roadId;
  if (bridgeId) where.bridgeId = bridgeId;
  if (transitId) where.transitId = transitId;

  const [items, total] = await Promise.all([
    prisma.maintenanceRecord.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledDate: "asc" },
      include: includeAssets,
    }),
    prisma.maintenanceRecord.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMaintenance(id: string) {
  const record = await prisma.maintenanceRecord.findUnique({ where: { id }, include: includeAssets });
  if (!record) throw new ApiError(404, "Maintenance record not found");
  return record;
}

export async function createMaintenance(data: any) {
  if (data.roadId && !(await prisma.road.findUnique({ where: { id: data.roadId } }))) {
    throw new ApiError(404, "Road not found");
  }
  if (data.bridgeId && !(await prisma.bridge.findUnique({ where: { id: data.bridgeId } }))) {
    throw new ApiError(404, "Bridge not found");
  }
  if (data.transitId && !(await prisma.transitAsset.findUnique({ where: { id: data.transitId } }))) {
    throw new ApiError(404, "Transit asset not found");
  }
  return prisma.maintenanceRecord.create({ data });
}

export async function updateMaintenance(id: string, data: any) {
  try {
    return await prisma.maintenanceRecord.update({ where: { id }, data });
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "Maintenance record not found");
    throw e;
  }
}

export async function deleteMaintenance(id: string) {
  try {
    await prisma.maintenanceRecord.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "Maintenance record not found");
    throw e;
  }
}

export async function maintenanceCostSummary() {
  const [totals, byStatus] = await Promise.all([
    prisma.maintenanceRecord.aggregate({ _sum: { costEstimate: true, actualCost: true } }),
    prisma.maintenanceRecord.groupBy({ by: ["status"], _count: { _all: true }, _sum: { costEstimate: true, actualCost: true } }),
  ]);
  return {
    totalEstimated: totals._sum.costEstimate ?? 0,
    totalActual: totals._sum.actualCost ?? 0,
    byStatus,
  };
}
