import { Router } from "express";
import { makeCrudController } from "../controllers/crud.factory";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validateBody, validateQuery } from "../middleware/validate";
import { createTransitSchema, updateTransitSchema, listQuerySchema } from "../validators/asset.validators";

const router = Router();
const ctrl = makeCrudController("transitAsset", "TransitAsset");
const WRITE_ROLES = ["ADMIN", "PLANNER", "ENGINEER"];

router.get("/", requireAuth, validateQuery(listQuerySchema), ctrl.list);
router.get("/:id", requireAuth, ctrl.getById);
router.post("/", requireAuth, requireRole(...WRITE_ROLES), validateBody(createTransitSchema), ctrl.create);
router.patch("/:id", requireAuth, requireRole(...WRITE_ROLES), validateBody(updateTransitSchema), ctrl.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), ctrl.remove);

export default router;
