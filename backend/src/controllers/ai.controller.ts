import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import * as aiService from "../services/ai.service";

export const roadDeterioration = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await aiService.predictRoadDeterioration(req.params.id));
});

export const bridgeFailure = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await aiService.predictBridgeFailure(req.params.id));
});

export const history = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { assetType, assetId } = req.params;
  res.json({ items: await aiService.predictionHistory(assetType, assetId) });
});
