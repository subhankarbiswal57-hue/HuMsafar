import { Response } from "express";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import * as gisService from "../services/gis.service";
import { prisma } from "../config/prisma";

export const uploadLayer = asyncHandler(async (req: AuthRequest, res: Response) => {
  let geojson: any;
  if (req.file) {
    geojson = JSON.parse(req.file.buffer.toString("utf-8"));
  } else {
    geojson = req.body.geojson;
  }
  const name = req.body.name ?? req.file?.originalname ?? "Untitled Layer";
  const layerType = req.body.layerType ?? "custom";
  const layer = await gisService.saveGisLayer(name, layerType, geojson, req.user?.sub);
  res.status(201).json({ layer });
});

export const listLayers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const layers = await gisService.listGisLayers();
  res.json({ layers });
});

export const getLayer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const layer = await gisService.getGisLayer(req.params.id);
  res.json({ layer });
});

export const deleteLayer = asyncHandler(async (req: AuthRequest, res: Response) => {
  await gisService.deleteGisLayer(req.params.id);
  res.status(204).send();
});

export const buffer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { geojson, radiusKm } = req.body;
  if (!geojson) throw new ApiError(400, "geojson is required");
  const result = gisService.computeBuffer(geojson, Number(radiusKm));
  res.json({ result });
});

export const distance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { from, to } = req.body;
  if (!Array.isArray(from) || !Array.isArray(to)) throw new ApiError(400, "from and to must be [lng, lat]");
  res.json(gisService.computeDistance(from, to));
});

export const search = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { minLng, minLat, maxLng, maxLat } = req.query;
  if ([minLng, minLat, maxLng, maxLat].some((v) => v === undefined)) {
    throw new ApiError(400, "minLng, minLat, maxLng, maxLat are required query params");
  }
  const result = await gisService.spatialSearch([
    Number(minLng),
    Number(minLat),
    Number(maxLng),
    Number(maxLat),
  ]);
  res.json(result);
});

export const nearby = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lng, lat, radiusKm } = req.query;
  if ([lng, lat, radiusKm].some((v) => v === undefined)) {
    throw new ApiError(400, "lng, lat, radiusKm are required query params");
  }
  const [bridges, transit] = await Promise.all([
    prisma.bridge.findMany(),
    prisma.transitAsset.findMany(),
  ]);
  const nearbyBridges = gisService.bufferSearchAssets(Number(lng), Number(lat), Number(radiusKm), bridges);
  const nearbyTransit = gisService.bufferSearchAssets(Number(lng), Number(lat), Number(radiusKm), transit);
  res.json({ bridges: nearbyBridges, transit: nearbyTransit });
});
