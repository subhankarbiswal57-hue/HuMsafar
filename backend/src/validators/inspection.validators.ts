import { z } from "zod";

const conditionEnum = z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]);

const optionalUuid = z.preprocess((v) => (v === "" ? undefined : v), z.string().uuid().optional());

export const createInspectionSchema = z
  .object({
    notes: z.string().max(2000).optional(),
    conditionAtInspection: conditionEnum,
    roadId: optionalUuid,
    bridgeId: optionalUuid,
    inspectedAt: z.coerce.date().optional(),
  })
  .refine((d) => !!d.roadId !== !!d.bridgeId, {
    message: "Provide exactly one of roadId or bridgeId",
  });

export const listInspectionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  roadId: z.string().uuid().optional(),
  bridgeId: z.string().uuid().optional(),
});
