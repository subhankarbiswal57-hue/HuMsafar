import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import * as gisController from "../controllers/gis.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router();
const WRITE_ROLES = ["ADMIN", "PLANNER", "ENGINEER"];

router.get("/layers", requireAuth, gisController.listLayers);
router.get("/layers/:id", requireAuth, gisController.getLayer);
router.post("/layers/upload", requireAuth, requireRole(...WRITE_ROLES), upload.single("file"), gisController.uploadLayer);
router.delete("/layers/:id", requireAuth, requireRole("ADMIN"), gisController.deleteLayer);

router.post("/buffer", requireAuth, gisController.buffer);
router.post("/distance", requireAuth, gisController.distance);
router.get("/search", requireAuth, gisController.search);
router.get("/nearby", requireAuth, gisController.nearby);

export default router;
