import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import * as maintenanceService from "../services/maintenance.service";
import { prisma } from "../config/prisma";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = (req as any).validatedQuery ?? req.query;
  const result = await maintenanceService.listMaintenance({
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    status: q.status,
    roadId: q.roadId,
    bridgeId: q.bridgeId,
    transitId: q.transitId,
  });
  res.json(result);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await maintenanceService.getMaintenance(req.params.id);
  res.json({ item });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await maintenanceService.createMaintenance(req.body);
  await prisma.auditLog.create({ data: { userId: req.user?.sub, action: "CREATE", entity: "MaintenanceRecord", entityId: item.id } });
  res.status(201).json({ item });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await maintenanceService.updateMaintenance(req.params.id, req.body);
  await prisma.auditLog.create({ data: { userId: req.user?.sub, action: "UPDATE", entity: "MaintenanceRecord", entityId: item.id } });
  res.json({ item });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await maintenanceService.deleteMaintenance(req.params.id);
  await prisma.auditLog.create({ data: { userId: req.user?.sub, action: "DELETE", entity: "MaintenanceRecord", entityId: req.params.id } });
  res.status(204).send();
});

export const costSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json(await maintenanceService.maintenanceCostSummary());
});
