"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useList } from "@/lib/crudHooks";
import { api } from "@/lib/api";

const RISK_COLOR: Record<string, string> = { LOW: "#4ade80", MODERATE: "#e6a817", HIGH: "#f97316", CRITICAL: "#c62828" };

function PredictionResult({ result }: { result: any }) {
  const chartData = Object.entries(result.explanation as Record<string, number>).map(([k, v]) => ({ feature: k, importance: v }));
  return (
    <Card className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ background: RISK_COLOR[result.riskLevel] }}>
          {result.riskLevel} RISK
        </span>
        <span className="text-sm text-gray-500">Confidence: {Math.round(result.confidence * 100)}%</span>
      </div>
      {"predictedConditionScore12mo" in result ? (
        <p className="mb-4 text-sm">
          Predicted condition score in 12 months: <strong>{result.predictedConditionScore12mo}</strong> (currently {result.currentConditionScore}, expected decline of {result.expectedDeclinePoints} points)
        </p>
      ) : (
        <p className="mb-4 text-sm">
          Estimated failure probability: <strong>{Math.round(result.failureProbability * 100)}%</strong>
        </p>
      )}
      <h3 className="mb-2 text-sm font-semibold text-gray-600">Top contributing factors</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="importance" fill="#0f5c9e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function PredictionsContent() {
  const { data: roads } = useList("roads", { limit: 100 });
  const { data: bridges } = useList("bridges", { limit: 100 });
  const [tab, setTab] = useState<"road" | "bridge">("road");
  const [assetId, setAssetId] = useState("");

  const roadPredict = useMutation({ mutationFn: async (id: string) => (await api.post(`/ai/roads/${id}/predict-deterioration`)).data });
  const bridgePredict = useMutation({ mutationFn: async (id: string) => (await api.post(`/ai/bridges/${id}/predict-failure`)).data });
  const active = tab === "road" ? roadPredict : bridgePredict;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">AI Prediction Engine</h1>
        <p className="text-sm text-gray-500">Deterioration forecasting and bridge failure risk, with explainable confidence scores</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "road" ? "primary" : "secondary"} onClick={() => { setTab("road"); setAssetId(""); }}>Road Deterioration</Button>
        <Button variant={tab === "bridge" ? "primary" : "secondary"} onClick={() => { setTab("bridge"); setAssetId(""); }}>Bridge Failure Risk</Button>
      </div>

      <Card className="max-w-lg">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Select {tab === "road" ? "a road" : "a bridge"}
          </label>
          <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
            <option value="">Select...</option>
            {(tab === "road" ? roads?.items : bridges?.items)?.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
            ))}
          </select>
          <Button disabled={!assetId} loading={active.isPending} onClick={() => active.mutate(assetId)}>
            Run prediction
          </Button>
          {active.isError && <p className="text-sm text-danger">Prediction failed — is the AI service running?</p>}
        </div>
      </Card>

      {active.data && <div className="max-w-lg"><PredictionResult result={active.data} /></div>}
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"]}>
      <AppShell>
        <PredictionsContent />
      </AppShell>
    </AuthGuard>
  );
}
