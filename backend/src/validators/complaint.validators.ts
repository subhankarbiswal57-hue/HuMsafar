import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(2000),
  category: z.enum(["POTHOLE", "STREETLIGHT", "DRAINAGE", "SIGNAGE", "TRAFFIC_SIGNAL", "OTHER"]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  reporterName: z.string().max(120).optional(),
  reporterEmail: z.string().email().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  resolutionNotes: z.string().max(2000).optional(),
});

export const listComplaintsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  category: z.string().optional(),
  mine: z.coerce.boolean().optional(),
});
