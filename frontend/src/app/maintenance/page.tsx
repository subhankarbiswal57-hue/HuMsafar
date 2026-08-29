"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/Card";
import { useList, useCreate, useUpdate } from "@/lib/crudHooks";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";

const ASSET_TYPES = [
  { value: "road", label: "Road" },
  { value: "bridge", label: "Bridge" },
  { value: "transit", label: "Transit Asset" },
];

const schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  costEstimate: z.coerce.number().positive().optional(),
  scheduledDate: z.string().optional(),
  assetType: z.enum(["road", "bridge", "transit"]),
  assetId: z.string().min(1, "Select an asset"),
});
type FormData = z.infer<typeof schema>;

const STATUS_BADGE: Record<string, string> = {
  PLANNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

function MaintenanceContent() {
  const { data, isLoading } = useList("maintenance", { limit: 50 });
  const { data: summary } = useQuery({ queryKey: ["maintenance", "cost-summary"], queryFn: async () => (await api.get("/maintenance/cost-summary")).data });
  const { data: roads } = useList("roads", { limit: 100 });
  const { data: bridges } = useList("bridges", { limit: 100 });
  const { data: transit } = useList("transit", { limit: 100 });
  const create = useCreate("maintenance");
  const update = useUpdate("maintenance");
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role && ["ADMIN", "PLANNER", "ENGINEER"].includes(role);

  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { assetType: "road" },
  });
  const assetType = watch("assetType");
  const assetOptions = assetType === "road" ? roads?.items : assetType === "bridge" ? bridges?.items : transit?.items;

  function onSubmit(values: FormData) {
    const payload: any = {
      title: values.title,
      description: values.description,
      costEstimate: values.costEstimate,
      scheduledDate: values.scheduledDate || undefined,
      [`${values.assetType}Id`]: values.assetId,
    };
    create.mutateAsync(payload).then(() => {
      setModalOpen(false);
      reset({ assetType: "road" } as any);
    });
  }

  function advanceStatus(id: string, status: string) {
    update.mutate({ id, data: { status } });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-sm text-gray-500">Scheduled and historical maintenance work</p>
        </div>
        {canWrite && <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Schedule work</Button>}
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Estimated Cost" value={`$${summary.totalEstimated.toLocaleString()}`} />
          <StatCard label="Actual Cost" value={`$${summary.totalActual.toLocaleString()}`} />
          <StatCard label="Total Records" value={data?.total ?? 0} />
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { header: "Title", accessor: (r: any) => r.title },
            { header: "Asset", accessor: (r: any) => r.road?.name ?? r.bridge?.name ?? r.transit?.name ?? "—" },
            { header: "Est. Cost", accessor: (r: any) => (r.costEstimate ? `$${r.costEstimate.toLocaleString()}` : "—") },
            { header: "Scheduled", accessor: (r: any) => (r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "—") },
            {
              header: "Status",
              accessor: (r: any) => (
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[r.status]}`}>{r.status.replace("_", " ")}</span>
              ),
            },
            {
              header: "Actions",
              accessor: (r: any) =>
                canWrite && r.status !== "COMPLETED" && r.status !== "CANCELLED" ? (
                  <div className="flex gap-2">
                    {r.status === "PLANNED" && (
                      <button className="text-xs text-primary hover:underline" onClick={() => advanceStatus(r.id, "IN_PROGRESS")}>Start</button>
                    )}
                    {r.status === "IN_PROGRESS" && (
                      <button className="text-xs text-accent hover:underline" onClick={() => advanceStatus(r.id, "COMPLETED")}>Complete</button>
                    )}
                    <button className="text-xs text-danger hover:underline" onClick={() => advanceStatus(r.id, "CANCELLED")}>Cancel</button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Maintenance">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" {...register("title")} error={errors.title?.message} />
          <Input label="Description" {...register("description")} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Estimated Cost ($)" type="number" {...register("costEstimate")} />
            <Input label="Scheduled Date" type="date" {...register("scheduledDate")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Asset Type</label>
              <select {...register("assetType")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
          <Button type="submit" loading={create.isPending}>Create record</Button>
        </form>
      </Modal>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <AuthGuard>
      <AppShell>
        <MaintenanceContent />
      </AppShell>
    </AuthGuard>
  );
}
