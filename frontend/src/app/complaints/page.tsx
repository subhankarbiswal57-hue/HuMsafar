"use client";
import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useList, usePatchAction } from "@/lib/crudHooks";

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  ACKNOWLEDGED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
const STATUS_OPTIONS = ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function ComplaintsContent() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useList("complaints", { limit: 50, ...(statusFilter ? { status: statusFilter } : {}) });
  const updateStatus = usePatchAction("complaints");
  const [editing, setEditing] = useState<any>(null);
  const [nextStatus, setNextStatus] = useState("");
  const [notes, setNotes] = useState("");

  function openUpdate(c: any) {
    setEditing(c);
    setNextStatus(c.status);
    setNotes(c.resolutionNotes ?? "");
  }

  function submitUpdate() {
    updateStatus.mutate(
      { id: editing.id, path: "status", data: { status: nextStatus, resolutionNotes: notes } },
      { onSuccess: () => setEditing(null) }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Citizen Complaints</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} reports on file</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (data?.items ?? []).length === 0 ? (
        <Card className="text-center text-sm text-gray-500">No complaints match this filter.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((c: any) => (
            <Card key={c.id} className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {c.category.replace("_", " ")} &middot; {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)} &middot;{" "}
                  {c.reporter ? `${c.reporter.firstName} ${c.reporter.lastName}` : "Anonymous"} &middot;{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[c.status]}`}>{c.status.replace("_", " ")}</span>
                <Button variant="secondary" onClick={() => openUpdate(c)}>Update</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Update complaint status">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
            <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Resolution notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              placeholder="Visible to the citizen who reported this"
            />
          </div>
          <Button onClick={submitUpdate} loading={updateStatus.isPending}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"]}>
      <AppShell>
        <ComplaintsContent />
      </AppShell>
    </AuthGuard>
  );
}
