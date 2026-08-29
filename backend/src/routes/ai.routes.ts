import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import * as ai from "../controllers/ai.controller";

const router = Router();
const STAFF_ROLES = ["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"];

router.post("/roads/:id/predict-deterioration", requireAuth, requireRole(...STAFF_ROLES), ai.roadDeterioration);
router.post("/bridges/:id/predict-failure", requireAuth, requireRole(...STAFF_ROLES), ai.bridgeFailure);
router.get("/history/:assetType/:assetId", requireAuth, requireRole(...STAFF_ROLES), ai.history);

export default router;
