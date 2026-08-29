"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

const GisMap = dynamic(() => import("@/components/map/GisMap"), { ssr: false });

function MapContent() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role && ["ADMIN", "PLANNER", "ENGINEER"].includes(role);

  const { data: roads } = useQuery({ queryKey: ["roads", "all"], queryFn: async () => (await api.get("/roads", { params: { limit: 100 } })).data.items });
  const { data: bridges } = useQuery({ queryKey: ["bridges", "all"], queryFn: async () => (await api.get("/bridges", { params: { limit: 100 } })).data.items });
  const { data: transit } = useQuery({ queryKey: ["transit", "all"], queryFn: async () => (await api.get("/transit", { params: { limit: 100 } })).data.items });
  const { data: layers } = useQuery({ queryKey: ["gis-layers"], queryFn: async () => (await api.get("/gis/layers")).data.layers });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("layerType", "upload");
      await api.post("/gis/layers/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      qc.invalidateQueries({ queryKey: ["gis-layers"] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GIS Map</h1>
          <p className="text-sm text-gray-500">Roads, bridges, transit assets and uploaded layers</p>
        </div>
        {canWrite && (
          <div>
            <input ref={fileRef} type="file" accept=".json,.geojson" className="hidden" onChange={handleUpload} />
            <Button onClick={() => fileRef.current?.click()} loading={uploading}>
              <UploadCloud size={16} /> Upload GeoJSON layer
            </Button>
          </div>
        )}
      </div>
      <Card className="flex-1 p-0 overflow-hidden">
        <GisMap roads={roads ?? []} bridges={bridges ?? []} transit={transit ?? []} layers={layers ?? []} />
      </Card>
    </div>
  );
}

export default function MapPage() {
  return (
    <AuthGuard>
      <AppShell>
        <MapContent />
      </AppShell>
    </AuthGuard>
  );
}
