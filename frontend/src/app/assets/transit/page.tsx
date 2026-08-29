"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useList, useCreate, useUpdate, useDelete } from "@/lib/crudHooks";
import { useAuthStore } from "@/lib/authStore";

const schema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["BUS_STOP", "RAIL_STATION", "SIGNAL", "DEPOT"]),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
type FormData = z.infer<typeof schema>;

function TransitContent() {
  const { data, isLoading } = useList("transit", { limit: 50 });
  const create = useCreate("transit");
  const update = useUpdate("transit");
  const del = useDelete("transit");
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role && ["ADMIN", "PLANNER", "ENGINEER"].includes(role);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: "GOOD", type: "BUS_STOP" },
  });

  function openCreate() {
    setEditing(null);
    reset({ condition: "GOOD", type: "BUS_STOP" } as any);
    setModalOpen(true);
  }
  function openEdit(row: any) {
    setEditing(row);
    reset(row);
    setModalOpen(true);
  }
  function onSubmit(values: FormData) {
    const action = editing ? update.mutateAsync({ id: editing.id, data: values }) : create.mutateAsync(values);
    action.then(() => setModalOpen(false));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transit Assets</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} transit assets registered</p>
        </div>
        {canWrite && <Button onClick={openCreate}><Plus size={16} /> New Asset</Button>}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { header: "Code", accessor: (r: any) => r.code },
            { header: "Name", accessor: (r: any) => r.name },
            { header: "Type", accessor: (r: any) => r.type.replace("_", " ") },
            { header: "Condition", accessor: (r: any) => r.condition },
            {
              header: "Actions",
              accessor: (r: any) =>
                canWrite ? (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="text-primary hover:opacity-70"><Pencil size={16} /></button>
                    <button onClick={() => del.mutate(r.id)} className="text-danger hover:opacity-70"><Trash2 size={16} /></button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Asset" : "New Transit Asset"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" {...register("code")} error={errors.code?.message} disabled={!!editing} />
            <Input label="Name" {...register("name")} error={errors.name?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
              <select {...register("type")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                {["BUS_STOP", "RAIL_STATION", "SIGNAL", "DEPOT"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Condition</label>
              <select {...register("condition")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                {["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" type="number" step="0.0001" {...register("latitude")} error={errors.latitude?.message} />
            <Input label="Longitude" type="number" step="0.0001" {...register("longitude")} error={errors.longitude?.message} />
          </div>
          <Button type="submit" loading={create.isPending || update.isPending}>{editing ? "Save changes" : "Create asset"}</Button>
        </form>
      </Modal>
    </div>
  );
}

export default function TransitPage() {
  return (
    <AuthGuard>
      <AppShell>
        <TransitContent />
      </AppShell>
    </AuthGuard>
  );
}
