import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";

interface ListParams {
  page: number;
  limit: number;
  condition?: string;
  search?: string;
  searchFields?: string[];
}

export function makeCrudService(modelName: "road" | "bridge" | "transitAsset" | "infraAsset") {
  const model = (prisma as any)[modelName];

  return {
    async list({ page, limit, condition, search, searchFields = ["name", "code"] }: ListParams) {
      const where: any = {};
      if (condition) where.condition = condition;
      if (search) {
        where.OR = searchFields.map((f) => ({ [f]: { contains: search, mode: "insensitive" } }));
      }
      const [items, total] = await Promise.all([
        model.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
        model.count({ where }),
      ]);
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async getById(id: string) {
      const item = await model.findUnique({ where: { id } });
      if (!item) throw new ApiError(404, "Resource not found");
      return item;
    },

    async create(data: any, createdById?: string) {
      try {
        return await model.create({ data: createdById ? { ...data, createdById } : data });
      } catch (e: any) {
        if (e.code === "P2002") throw new ApiError(409, "A record with this code already exists");
        throw e;
      }
    },

    async update(id: string, data: any) {
      try {
        return await model.update({ where: { id }, data });
      } catch (e: any) {
        if (e.code === "P2025") throw new ApiError(404, "Resource not found");
        if (e.code === "P2002") throw new ApiError(409, "A record with this code already exists");
        throw e;
      }
    },

    async remove(id: string) {
      try {
        await model.delete({ where: { id } });
      } catch (e: any) {
        if (e.code === "P2025") throw new ApiError(404, "Resource not found");
        throw e;
      }
    },
  };
}
