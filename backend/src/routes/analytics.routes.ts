import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as analytics from "../controllers/analytics.controller";

const router = Router();
router.get("/summary", requireAuth, analytics.summary);
router.get("/condition-trend", requireAuth, analytics.conditionTrend);
router.get("/maintenance-cost-trend", requireAuth, analytics.maintenanceCostTrend);
router.get("/complaints-trend", requireAuth, analytics.complaintsTrend);

export default router;
