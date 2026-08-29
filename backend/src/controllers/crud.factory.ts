import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { makeCrudService } from "../services/crud.factory";
import { prisma } from "../config/prisma";

export function makeCrudController(
  modelName: "road" | "bridge" | "transitAsset" | "infraAsset",
  entityLabel: string,
  searchFields?: string[]
) {
  const service = makeCrudService(modelName);

  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const q = (req as any).validatedQuery ?? req.query;
      const result = await service.list({
        page: Number(q.page) || 1,
        limit: Number(q.limit) || 20,
        condition: q.condition,
        search: q.search,
        searchFields,
      });
      res.json(result);
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.getById(req.params.id);
      res.json({ item });
    }),

    create: asyncHandler(async (req: AuthRequest, res: Response) => {
      const item = await service.create(req.body, req.user?.sub);
      await prisma.auditLog.create({
        data: { userId: req.user?.sub, action: "CREATE", entity: entityLabel, entityId: item.id, metadata: req.body },
      });
      res.status(201).json({ item });
    }),

    update: asyncHandler(async (req: AuthRequest, res: Response) => {
      const item = await service.update(req.params.id, req.body);
      await prisma.auditLog.create({
        data: { userId: req.user?.sub, action: "UPDATE", entity: entityLabel, entityId: item.id, metadata: req.body },
      });
      res.json({ item });
    }),

    remove: asyncHandler(async (req: AuthRequest, res: Response) => {
      await service.remove(req.params.id);
      await prisma.auditLog.create({
        data: { userId: req.user?.sub, action: "DELETE", entity: entityLabel, entityId: req.params.id },
      });
      res.status(204).send();
    }),
  };
}
