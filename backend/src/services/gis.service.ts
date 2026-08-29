import * as turf from "@turf/turf";
import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";

export async function saveGisLayer(name: string, layerType: string, geojson: any, uploadedBy?: string) {
  if (!geojson || (geojson.type !== "FeatureCollection" && geojson.type !== "Feature")) {
    throw new ApiError(400, "Invalid GeoJSON: must be a Feature or FeatureCollection");
  }
  return prisma.gisLayer.create({ data: { name, layerType, geojson, uploadedBy } });
}

export async function listGisLayers() {
  return prisma.gisLayer.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getGisLayer(id: string) {
  const layer = await prisma.gisLayer.findUnique({ where: { id } });
  if (!layer) throw new ApiError(404, "Layer not found");
  return layer;
}

export async function deleteGisLayer(id: string) {
  await prisma.gisLayer.delete({ where: { id } }).catch(() => {
    throw new ApiError(404, "Layer not found");
  });
}

export function computeBuffer(geojson: any, radiusKm: number) {
  if (radiusKm <= 0 || radiusKm > 500) throw new ApiError(400, "radiusKm must be between 0 and 500");
  return turf.buffer(geojson, radiusKm, { units: "kilometers" });
}

export function computeDistance(from: [number, number], to: [number, number]) {
  const a = turf.point(from);
  const b = turf.point(to);
  return { distanceKm: turf.distance(a, b, { units: "kilometers" }) };
}

// Bounding-box spatial search across roads (line geometry), bridges & transit (point geometry)
export async function spatialSearch(bbox: [number, number, number, number]) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const bboxPoly = turf.bboxPolygon(bbox);

  const [bridges, transit, roads] = await Promise.all([
    prisma.bridge.findMany({
      where: { latitude: { gte: minLat, lte: maxLat }, longitude: { gte: minLng, lte: maxLng } },
    }),
    prisma.transitAsset.findMany({
      where: { latitude: { gte: minLat, lte: maxLat }, longitude: { gte: minLng, lte: maxLng } },
    }),
    prisma.road.findMany(),
  ]);

  const roadsInBbox = roads.filter((r) => {
    try {
      return turf.booleanIntersects(r.geometry as any, bboxPoly);
    } catch {
      return false;
    }
  });

  return { bridges, transit, roads: roadsInBbox };
}

export function bufferSearchAssets(centerLng: number, centerLat: number, radiusKm: number, points: any[]) {
  const center = turf.point([centerLng, centerLat]);
  return points.filter((p) => {
    const d = turf.distance(center, turf.point([p.longitude, p.latitude]), { units: "kilometers" });
    return d <= radiusKm;
  });
}
