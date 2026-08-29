import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validateBody, validateQuery } from "../middleware/validate";
import { photoUpload } from "../utils/upload";
import * as inspectionController from "../controllers/inspection.controller";
import { createInspectionSchema, listInspectionsQuerySchema } from "../validators/inspection.validators";

const router = Router();
const WRITE_ROLES = ["ADMIN", "PLANNER", "ENGINEER"];

router.get("/", requireAuth, validateQuery(listInspectionsQuerySchema), inspectionController.list);
router.post(
  "/",
  requireAuth,
  requireRole(...WRITE_ROLES),
  photoUpload.array("photos", 5),
  validateBody(createInspectionSchema),
  inspectionController.create
);

export default router;
