"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Camera } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useList, useCreateMultipart } from "@/lib/crudHooks";
import { useAuthStore } from "@/lib/authStore";

const schema = z.object({
  notes: z.string().optional(),
  conditionAtInspection: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]),
  assetType: z.enum(["road", "bridge"]),
  assetId: z.string().min(1, "Select an asset"),
});
type FormData = z.infer<typeof schema>;

const CONDITION_BADGE: Record<string, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-800",
  GOOD: "bg-green-100 text-green-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

function InspectionsContent() {
  const { data, isLoading } = useList("inspections", { limit: 50 });
  const { data: roads } = useList("roads", { limit: 100 });
  const { data: bridges } = useList("bridges", { limit: 100 });
  const create = useCreateMultipart("inspections");
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role && ["ADMIN", "PLANNER", "ENGINEER"].includes(role);

  const [modalOpen, setModalOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { assetType: "road", conditionAtInspection: "GOOD" },
  });
  const assetType = watch("assetType");
  const assetOptions = assetType === "road" ? roads?.items : bridges?.items;

  function onSubmit(values: FormData) {
    const form = new FormData();
    form.append("notes", values.notes ?? "");
    form.append("conditionAtInspection", values.conditionAtInspection);
    form.append(`${values.assetType}Id`, values.assetId);
    photos.forEach((p) => form.append("photos", p));
    create.mutateAsync(form).then(() => {
      setModalOpen(false);
      setPhotos([]);
      reset({ assetType: "road", conditionAtInspection: "GOOD" } as any);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspections</h1>
          <p className="text-sm text-gray-500">Field inspection history — updates the asset's live condition</p>
        </div>
        {canWrite && <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Log inspection</Button>}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { header: "Asset", accessor: (r: any) => r.road?.name ?? r.bridge?.name ?? "—" },
            {
              header: "Condition Found",
              accessor: (r: any) => (
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${CONDITION_BADGE[r.conditionAtInspection]}`}>
                  {r.conditionAtInspection}
                </span>
              ),
            },
            { header: "Notes", accessor: (r: any) => r.notes ?? "—" },
            { header: "Photos", accessor: (r: any) => r.photoUrls?.length ?? 0 },
            { header: "Inspector", accessor: (r: any) => (r.inspector ? `${r.inspector.firstName} ${r.inspector.lastName}` : "—") },
            { header: "Date", accessor: (r: any) => new Date(r.inspectedAt).toLocaleDateString() },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Inspection">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Asset Type</label>
              <select {...register("assetType")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                <option value="road">Road</option>
                <option value="bridge">Bridge</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Asset</label>
              <select {...register("assetId")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                <option value="">Select...</option>
                {assetOptions?.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
              </select>
              {errors.assetId && <span className="text-xs text-danger">{errors.assetId.message}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Condition Found</label>
            <select {...register("conditionAtInspection")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
              {["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
            <textarea rows={3} {...register("notes")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <Camera size={18} />
            {photos.length ? `${photos.length} photo(s) selected` : "Attach inspection photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))} />
          </label>
          <Button type="submit" loading={create.isPending}>Save inspection</Button>
        </form>
      </Modal>
    </div>
  );
}

export default function InspectionsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"]}>
      <AppShell>
        <InspectionsContent />
      </AppShell>
    </AuthGuard>
  );
}
