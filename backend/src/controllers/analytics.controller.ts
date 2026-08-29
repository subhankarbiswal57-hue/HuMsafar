import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export const summary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [roadAgg, bridgeAgg, maintAgg, complaintTotal, complaintResolved] = await Promise.all([
    prisma.road.aggregate({ _avg: { conditionScore: true }, _sum: { lengthKm: true }, _count: true }),
    prisma.bridge.aggregate({ _avg: { conditionScore: true }, _count: true }),
    prisma.maintenanceRecord.aggregate({ _sum: { costEstimate: true, actualCost: true }, _count: true }),
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
  ]);
  res.json({
    avgRoadCondition: roadAgg._avg.conditionScore ?? 0,
    avgBridgeCondition: bridgeAgg._avg.conditionScore ?? 0,
    totalRoadKm: roadAgg._sum.lengthKm ?? 0,
    roadCount: roadAgg._count,
    bridgeCount: bridgeAgg._count,
    maintenanceRecords: maintAgg._count,
    estimatedSpend: maintAgg._sum.costEstimate ?? 0,
    actualSpend: maintAgg._sum.actualCost ?? 0,
    complaintResolutionRate: complaintTotal ? Math.round((complaintResolved / complaintTotal) * 100) : 0,
  });
});

export const conditionTrend = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rows = await prisma.$queryRaw<{ month: Date; avg_score: number; inspections: bigint }[]>`
    SELECT date_trunc('month', "inspectedAt") AS month,
           AVG(CASE "conditionAtInspection"
             WHEN 'EXCELLENT' THEN 95 WHEN 'GOOD' THEN 80 WHEN 'FAIR' THEN 60
             WHEN 'POOR' THEN 35 ELSE 10 END) AS avg_score,
           COUNT(*) AS inspections
    FROM "Inspection"
    GROUP BY 1 ORDER BY 1 ASC;
  `;
  res.json(rows.map((r) => ({ month: r.month, avgScore: Number(r.avg_score), inspections: Number(r.inspections) })));
});

export const maintenanceCostTrend = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rows = await prisma.$queryRaw<{ month: Date; estimated: number; actual: number }[]>`
    SELECT date_trunc('month', COALESCE("scheduledDate", "createdAt")) AS month,
           COALESCE(SUM("costEstimate"), 0) AS estimated,
           COALESCE(SUM("actualCost"), 0) AS actual
    FROM "MaintenanceRecord"
    GROUP BY 1 ORDER BY 1 ASC;
  `;
  res.json(rows.map((r) => ({ month: r.month, estimated: Number(r.estimated), actual: Number(r.actual) })));
});

export const complaintsTrend = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rows = await prisma.$queryRaw<{ month: Date; category: string; count: bigint }[]>`
    SELECT date_trunc('month', "createdAt") AS month, category, COUNT(*) AS count
    FROM "Complaint"
    GROUP BY 1, 2 ORDER BY 1 ASC;
  `;
  res.json(rows.map((r) => ({ month: r.month, category: r.category, count: Number(r.count) })));
});
