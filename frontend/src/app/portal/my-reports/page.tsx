"use client";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useList } from "@/lib/crudHooks";

const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  ACKNOWLEDGED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function MyReportsContent() {
  const { data, isLoading } = useList("complaints", { mine: true, limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-sm text-gray-500">Track the status of issues you've reported</p>
        </div>
        <Link href="/portal/report"><Button>Report new issue</Button></Link>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (data?.items ?? []).length === 0 ? (
        <Card className="text-center text-sm text-gray-500">You haven't reported any issues yet.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((c: any) => (
            <Card key={c.id} className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {c.category.replace("_", " ")} &middot; Reported {new Date(c.createdAt).toLocaleDateString()}
                </p>
                {c.resolutionNotes && (
                  <p className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800">
                    <strong>Update:</strong> {c.resolutionNotes}
                  </p>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[c.status]}`}>
                {c.status.replace("_", " ")}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyReportsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <MyReportsContent />
      </AppShell>
    </AuthGuard>
  );
}
