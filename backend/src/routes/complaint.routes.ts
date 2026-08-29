import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validateBody, validateQuery } from "../middleware/validate";
import { photoUpload } from "../utils/upload";
import * as complaintController from "../controllers/complaint.controller";
import { createComplaintSchema, updateComplaintStatusSchema, listComplaintsQuerySchema } from "../validators/complaint.validators";

const router = Router();
const STAFF_ROLES = ["ADMIN", "PLANNER", "ENGINEER"];

const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.get("/stats", requireAuth, requireRole(...STAFF_ROLES), complaintController.stats);
router.get("/", requireAuth, validateQuery(listComplaintsQuerySchema), complaintController.list);
router.get("/:id", requireAuth, complaintController.getById);
router.post(
  "/",
  requireAuth,
  reportLimiter,
  photoUpload.array("photos", 5),
  validateBody(createComplaintSchema),
  complaintController.create
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(...STAFF_ROLES),
  validateBody(updateComplaintStatusSchema),
  complaintController.updateStatus
);

export default router;
