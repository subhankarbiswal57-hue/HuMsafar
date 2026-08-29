import { z } from "zod";

const conditionEnum = z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]);
const surfaceEnum = z.enum(["ASPHALT", "CONCRETE", "GRAVEL", "UNPAVED"]);
const transitTypeEnum = z.enum(["BUS_STOP", "RAIL_STATION", "SIGNAL", "DEPOT"]);
const assetTypeEnum = z.enum(["UTILITY_POLE", "DRAINAGE", "STREETLIGHT", "SIGNAGE", "OTHER"]);

export const createRoadSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  surfaceType: surfaceEnum.optional(),
  lengthKm: z.number().positive(),
  widthM: z.number().positive().optional(),
  lanes: z.number().int().min(1).max(20).optional(),
  condition: conditionEnum.optional(),
  conditionScore: z.number().min(0).max(100).optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  geometry: z.record(z.any()),
  properties: z.record(z.any()).optional(),
});
export const updateRoadSchema = createRoadSchema.partial();

export const createBridgeSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  spanLengthM: z.number().positive(),
  widthM: z.number().positive().optional(),
  material: z.string().min(1).max(100),
  condition: conditionEnum.optional(),
  conditionScore: z.number().min(0).max(100).optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  loadCapacityT: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  properties: z.record(z.any()).optional(),
});
export const updateBridgeSchema = createBridgeSchema.partial();

export const createTransitSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: transitTypeEnum,
  condition: conditionEnum.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  properties: z.record(z.any()).optional(),
});
export const updateTransitSchema = createTransitSchema.partial();

export const createInfraAssetSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  type: assetTypeEnum,
  condition: conditionEnum.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  properties: z.record(z.any()).optional(),
});
export const updateInfraAssetSchema = createInfraAssetSchema.partial();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  condition: conditionEnum.optional(),
  search: z.string().optional(),
});
