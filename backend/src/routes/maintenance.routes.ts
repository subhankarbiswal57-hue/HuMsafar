import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validateBody, validateQuery } from "../middleware/validate";
import * as maintenanceController from "../controllers/maintenance.controller";
import { createMaintenanceSchema, updateMaintenanceSchema, listMaintenanceQuerySchema } from "../validators/maintenance.validators";

const router = Router();
const WRITE_ROLES = ["ADMIN", "PLANNER", "ENGINEER"];

router.get("/cost-summary", requireAuth, maintenanceController.costSummary);
router.get("/", requireAuth, validateQuery(listMaintenanceQuerySchema), maintenanceController.list);
router.get("/:id", requireAuth, maintenanceController.getById);
router.post("/", requireAuth, requireRole(...WRITE_ROLES), validateBody(createMaintenanceSchema), maintenanceController.create);
router.patch("/:id", requireAuth, requireRole(...WRITE_ROLES), validateBody(updateMaintenanceSchema), maintenanceController.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), maintenanceController.remove);

export default router;
