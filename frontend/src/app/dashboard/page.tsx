"use client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/Card";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { Route, Landmark, TrainFront, Ruler, Loader2, Clock, User, Zap } from "lucide-react";

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "#10b981",
  GOOD: "#22d3ee",
  FAIR: "#f59e0b",
  POOR: "#f97316",
  CRITICAL: "#ef4444",
};

const CHART_STYLE = {
  fontSize: 11,
  fontFamily: "Inter, sans-serif",
};

function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
  });

  if (isLoading || !data)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          <span className="text-sm text-slate-500">Loading dashboard data...</span>
        </div>
      </div>
    );

  const roadChart = data.roadsByCondition.map((r: any) => ({ condition: r.condition, count: r._count._all }));
  const bridgeChart = data.bridgesByCondition.map((r: any) => ({ condition: r.condition, count: r._count._all }));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Infrastructure Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Live data from the asset registry • Last updated just now</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <StatCard label="Roads" value={data.totals.roads} icon={Route} trend="up" sub="Active assets" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard label="Bridges" value={data.totals.bridges} icon={Landmark} trend="up" sub="Monitored" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard label="Transit Assets" value={data.totals.transitAssets} icon={TrainFront} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard label="Total Road Length" value={`${data.totals.totalRoadLengthKm.toFixed(1)} km`} icon={Ruler} />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-white">Road Condition</h2>
              <span className="stat-badge">Distribution</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roadChart} dataKey="count" nameKey="condition" cx="50%" cy="50%" outerRadius={95} innerRadius={50} paddingAngle={3} label>
                  {roadChart.map((entry: any, i: number) => (
                    <Cell key={i} fill={CONDITION_COLORS[entry.condition] ?? "#6366f1"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", fontSize: "12px", color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={CHART_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-white">Bridge Condition</h2>
              <span className="stat-badge">By Category</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bridgeChart}>
                <XAxis dataKey="condition" tick={{ fill: "#64748b", ...CHART_STYLE }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748b", ...CHART_STYLE }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", fontSize: "12px", color: "#e2e8f0" }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {bridgeChart.map((entry: any, i: number) => (
                    <Cell key={i} fill={CONDITION_COLORS[entry.condition] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Activity</h2>
            <span className="stat-badge"><Zap className="h-3 w-3" /> Live Feed</span>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {data.recentActivity.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10">
                    <User className="h-4 w-4 text-primary-400" />
                  </div>
                  <span className="text-slate-300">
                    <strong className="text-white">{a.action}</strong>{" "}
                    <span className="text-slate-500">{a.entity}</span>{" "}
                    <span className="text-slate-600">by</span>{" "}
                    <span className="text-slate-400">{a.user ? `${a.user.firstName} ${a.user.lastName}` : "System"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock className="h-3 w-3" />
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-600">
                No activity yet. Start by adding infrastructure assets.
              </div>
            )}
          </div>
        </Card>
      </motion.div>
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
