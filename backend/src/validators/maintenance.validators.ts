import { z } from "zod";

const optionalUuid = z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional());
const statusEnum = z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const createMaintenanceSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    status: statusEnum.optional(),
    costEstimate: z.coerce.number().positive().optional(),
    actualCost: z.coerce.number().positive().optional(),
    scheduledDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
    roadId: optionalUuid,
    bridgeId: optionalUuid,
    transitId: optionalUuid,
  })
  .refine((d) => [d.roadId, d.bridgeId, d.transitId].filter(Boolean).length === 1, {
    message: "Provide exactly one of roadId, bridgeId or transitId",
  });

export const updateMaintenanceSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: statusEnum.optional(),
  costEstimate: z.coerce.number().positive().optional(),
  actualCost: z.coerce.number().positive().optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
});

export const listMaintenanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: statusEnum.optional(),
  roadId: z.string().uuid().optional(),
  bridgeId: z.string().uuid().optional(),
  transitId: z.string().uuid().optional(),
});
