import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export const stats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [roadCount, bridgeCount, transitCount, assetCount, roadsByCondition, bridgesByCondition, totalRoadKm, recentAudit] =
    await Promise.all([
      prisma.road.count(),
      prisma.bridge.count(),
      prisma.transitAsset.count(),
      prisma.infraAsset.count(),
      prisma.road.groupBy({ by: ["condition"], _count: { _all: true } }),
      prisma.bridge.groupBy({ by: ["condition"], _count: { _all: true } }),
      prisma.road.aggregate({ _sum: { lengthKm: true } }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true, email: true } } } }),
    ]);

  res.json({
    totals: {
      roads: roadCount,
      bridges: bridgeCount,
      transitAssets: transitCount,
      infraAssets: assetCount,
      totalRoadLengthKm: totalRoadKm._sum.lengthKm ?? 0,
    },
    roadsByCondition,
    bridgesByCondition,
    recentActivity: recentAudit,
  });
});
