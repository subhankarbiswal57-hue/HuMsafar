import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm transition-all",
        className
      )}
      {...props}
    />
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald" : trend === "down" ? "text-red-400" : "text-slate-500";

  return (
    <Card className="group flex flex-col gap-2 card-hover hover:border-primary-400/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        {Icon && (
          <div className="rounded-lg bg-primary-500/10 p-1.5">
            <Icon className="h-4 w-4 text-primary-400" />
          </div>
        )}
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
      {(sub || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />}
          {sub && <span className="text-xs text-slate-500">{sub}</span>}
        </div>
      )}
    </Card>
  );
}
