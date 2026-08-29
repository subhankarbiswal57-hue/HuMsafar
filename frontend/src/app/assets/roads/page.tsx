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
  lengthKm: z.coerce.number().positive(),
  widthM: z.coerce.number().positive().optional(),
  lanes: z.coerce.number().int().min(1).optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"]),
  yearBuilt: z.coerce.number().int().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const CONDITION_BADGE: Record<string, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-800",
  GOOD: "bg-green-100 text-green-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  POOR: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

function RoadsContent() {
  const { data, isLoading } = useList("roads", { limit: 50 });
  const create = useCreate("roads");
  const update = useUpdate("roads");
  const del = useDelete("roads");
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role && ["ADMIN", "PLANNER", "ENGINEER"].includes(role);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: "GOOD" },
  });

  function openCreate() {
    setEditing(null);
    reset({ condition: "GOOD" } as any);
    setModalOpen(true);
  }

  function openEdit(row: any) {
    setEditing(row);
    reset({
      code: row.code,
      name: row.name,
      lengthKm: row.lengthKm,
      widthM: row.widthM ?? undefined,
      lanes: row.lanes,
      condition: row.condition,
      yearBuilt: row.yearBuilt ?? undefined,
      description: row.description ?? "",
    });
    setModalOpen(true);
  }

  function onSubmit(values: FormData) {
    const payload = {
      ...values,
      geometry: editing?.geometry ?? { type: "LineString", coordinates: [[80.27, 13.08], [80.28, 13.09]] },
    };
    const action = editing ? update.mutateAsync({ id: editing.id, data: payload }) : create.mutateAsync(payload);
    action.then(() => setModalOpen(false));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Road Inventory</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} roads registered</p>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus size={16} /> New Road
          </Button>
        )}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          rows={data?.items ?? []}
          columns={[
            { header: "Code", accessor: (r: any) => r.code },
            { header: "Name", accessor: (r: any) => r.name },
            { header: "Length (km)", accessor: (r: any) => r.lengthKm },
            { header: "Lanes", accessor: (r: any) => r.lanes },
            {
              header: "Condition",
              accessor: (r: any) => (
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${CONDITION_BADGE[r.condition]}`}>{r.condition}</span>
              ),
            },
            {
              header: "Actions",
              accessor: (r: any) =>
                canWrite ? (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="text-primary hover:opacity-70">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => del.mutate(r.id)} className="text-danger hover:opacity-70">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null,
            },
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Road" : "New Road"}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Code" {...register("code")} error={errors.code?.message} disabled={!!editing} />
            <Input label="Name" {...register("name")} error={errors.name?.message} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Length (km)" type="number" step="0.01" {...register("lengthKm")} error={errors.lengthKm?.message} />
            <Input label="Width (m)" type="number" step="0.1" {...register("widthM")} />
            <Input label="Lanes" type="number" {...register("lanes")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Condition</label>
              <select {...register("condition")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                {["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input label="Year Built" type="number" {...register("yearBuilt")} />
          </div>
          <Input label="Description" {...register("description")} />
          <Button type="submit" loading={create.isPending || update.isPending}>
            {editing ? "Save changes" : "Create road"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default function RoadsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <RoadsContent />
      </AppShell>
    </AuthGuard>
  );
}
