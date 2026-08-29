import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { stats } from "../controllers/dashboard.controller";

const router = Router();
router.get("/stats", requireAuth, stats);
export default router;
