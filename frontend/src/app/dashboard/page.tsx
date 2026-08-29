"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/Card";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "#0f9e6e",
  GOOD: "#4ade80",
  FAIR: "#e6a817",
  POOR: "#f97316",
  CRITICAL: "#c62828",
};

function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
  });

  if (isLoading || !data) return <p>Loading dashboard...</p>;

  const roadChart = data.roadsByCondition.map((r: any) => ({ condition: r.condition, count: r._count._all }));
  const bridgeChart = data.bridgesByCondition.map((r: any) => ({ condition: r.condition, count: r._count._all }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Infrastructure Overview</h1>
        <p className="text-sm text-gray-500">Live data from the asset registry</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Roads" value={data.totals.roads} />
        <StatCard label="Bridges" value={data.totals.bridges} />
        <StatCard label="Transit Assets" value={data.totals.transitAssets} />
        <StatCard label="Total Road Length" value={`${data.totals.totalRoadLengthKm.toFixed(1)} km`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Road Condition Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={roadChart} dataKey="count" nameKey="condition" outerRadius={90} label>
                {roadChart.map((entry: any, i: number) => (
                  <Cell key={i} fill={CONDITION_COLORS[entry.condition] ?? "#999"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Bridge Condition Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bridgeChart}>
              <XAxis dataKey="condition" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f5c9e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Recent Activity</h2>
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {data.recentActivity.map((a: any) => (
            <li key={a.id} className="flex justify-between py-2 text-sm">
              <span>
                <strong>{a.action}</strong> {a.entity} by {a.user ? `${a.user.firstName} ${a.user.lastName}` : "System"}
              </span>
              <span className="text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          ))}
          {data.recentActivity.length === 0 && <li className="py-2 text-sm text-gray-500">No activity yet.</li>}
        </ul>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  );
}
