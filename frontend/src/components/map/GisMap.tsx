"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const bridgeIcon = new L.DivIcon({
  html: `<div style="background:#0f5c9e;width:14px;height:14px;border-radius:50%;border:2px solid white"></div>`,
  className: "",
  iconSize: [14, 14],
});
const transitIcon = new L.DivIcon({
  html: `<div style="background:#0f9e6e;width:14px;height:14px;border-radius:2px;border:2px solid white"></div>`,
  className: "",
  iconSize: [14, 14],
});

interface Props {
  roads: any[];
  bridges: any[];
  transit: any[];
  layers: any[];
  center?: [number, number];
}

const ROAD_COLOR: Record<string, string> = {
  EXCELLENT: "#0f9e6e",
  GOOD: "#4ade80",
  FAIR: "#e6a817",
  POOR: "#f97316",
  CRITICAL: "#c62828",
};

export default function GisMap({ roads, bridges, transit, layers, center = [13.0827, 80.2707] }: Props) {
  return (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {roads.map((r) => (
        <Polyline
          key={r.id}
          positions={(r.geometry?.coordinates ?? []).map((c: number[]) => [c[1], c[0]])}
          pathOptions={{ color: ROAD_COLOR[r.condition] ?? "#0f5c9e", weight: 5 }}
        >
          <Popup>
            <strong>{r.name}</strong>
            <br />
            {r.lengthKm} km &middot; {r.condition}
          </Popup>
        </Polyline>
      ))}
      {bridges.map((b) => (
        <Marker key={b.id} position={[b.latitude, b.longitude]} icon={bridgeIcon}>
          <Popup>
            <strong>{b.name}</strong>
            <br />
            Span: {b.spanLengthM}m &middot; {b.condition}
          </Popup>
        </Marker>
      ))}
      {transit.map((t) => (
        <Marker key={t.id} position={[t.latitude, t.longitude]} icon={transitIcon}>
          <Popup>
            <strong>{t.name}</strong>
            <br />
            {t.type.replace("_", " ")}
          </Popup>
        </Marker>
      ))}
      {layers.map((l) => (
        <GeoJSON key={l.id} data={l.geojson} style={{ color: "#9333ea", weight: 3 }} />
      ))}
    </MapContainer>
  );
}
