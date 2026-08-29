import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";

async function callAiService(path: string, body: unknown) {
  const resp = await fetch(`${env.AI_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new ApiError(502, "AI service request failed");
  return resp.json();
}

export async function predictRoadDeterioration(roadId: string) {
  const road = await prisma.road.findUnique({ where: { id: roadId } });
  if (!road) throw new ApiError(404, "Road not found");

  const result = await callAiService("/predict/deterioration", {
    yearBuilt: road.yearBuilt,
    lengthKm: road.lengthKm,
    widthM: road.widthM,
    lanes: road.lanes,
    surfaceType: road.surfaceType,
    conditionScore: road.conditionScore,
    currentYear: new Date().getFullYear(),
  });

  await prisma.aIPrediction.create({
    data: { assetType: "road", assetId: roadId, predictionType: "deterioration", result, confidence: result.confidence },
  });
  return result;
}

export async function predictBridgeFailure(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({ where: { id: bridgeId } });
  if (!bridge) throw new ApiError(404, "Bridge not found");

  const result = await callAiService("/predict/bridge-failure", {
    yearBuilt: bridge.yearBuilt,
    spanLengthM: bridge.spanLengthM,
    loadCapacityT: bridge.loadCapacityT,
    material: bridge.material,
    conditionScore: bridge.conditionScore,
    currentYear: new Date().getFullYear(),
  });

  await prisma.aIPrediction.create({
    data: { assetType: "bridge", assetId: bridgeId, predictionType: "failure", result, confidence: result.confidence },
  });
  return result;
}

export async function predictionHistory(assetType: string, assetId: string) {
  return prisma.aIPrediction.findMany({ where: { assetType, assetId }, orderBy: { createdAt: "desc" }, take: 20 });
}
