import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import * as inspectionService from "../services/inspection.service";
import { fileToPublicUrl } from "../utils/upload";
import { prisma } from "../config/prisma";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = (req as any).validatedQuery ?? req.query;
  const result = await inspectionService.listInspections({
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    roadId: q.roadId,
    bridgeId: q.bridgeId,
  });
  res.json(result);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const photoUrls = files.map((f) => fileToPublicUrl(f.filename));
  const inspection = await inspectionService.createInspection(req.body, photoUrls, req.user?.sub);
  await prisma.auditLog.create({
    data: { userId: req.user?.sub, action: "CREATE", entity: "Inspection", entityId: inspection.id },
  });
  res.status(201).json({ inspection });
});
