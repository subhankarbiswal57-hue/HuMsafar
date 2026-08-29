"use client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatCard } from "@/components/ui/Card";
import { api } from "@/lib/api";

const fmtMonth = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", year: "2-digit" });

function AnalyticsContent() {
  const { data: summary } = useQuery({ queryKey: ["analytics", "summary"], queryFn: async () => (await api.get("/analytics/summary")).data });
  const { data: condition } = useQuery({ queryKey: ["analytics", "condition"], queryFn: async () => (await api.get("/analytics/condition-trend")).data });
  const { data: cost } = useQuery({ queryKey: ["analytics", "cost"], queryFn: async () => (await api.get("/analytics/maintenance-cost-trend")).data });

  const conditionChart = (condition ?? []).map((r: any) => ({ month: fmtMonth(r.month), score: Math.round(r.avgScore) }));
  const costChart = (cost ?? []).map((r: any) => ({ month: fmtMonth(r.month), Estimated: r.estimated, Actual: r.actual }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500">Trends computed from live inspection, maintenance and complaint records</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Avg Road Condition" value={`${Math.round(summary.avgRoadCondition)}/100`} />
          <StatCard label="Avg Bridge Condition" value={`${Math.round(summary.avgBridgeCondition)}/100`} />
          <StatCard label="Estimated Spend" value={`$${summary.estimatedSpend.toLocaleString()}`} />
          <StatCard label="Complaint Resolution Rate" value={`${summary.complaintResolutionRate}%`} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Road Quality Trend (from inspections)</h2>
          {conditionChart.length === 0 ? (
            <p className="text-sm text-gray-500">No inspection history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={conditionChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f5c9e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Maintenance Cost Trend</h2>
          {costChart.length === 0 ? (
            <p className="text-sm text-gray-500">No maintenance records yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Estimated" fill="#0f5c9e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#0f9e6e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <AnalyticsContent />
      </AppShell>
    </AuthGuard>
  );
}
