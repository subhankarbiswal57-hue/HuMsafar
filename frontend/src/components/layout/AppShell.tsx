"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Route, Landmark, TrainFront, Map, LogOut,
  MessageSquareWarning, Wrench, ClipboardCheck, FilePlus2, BarChart3,
  BrainCircuit, ChevronRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/lib/authHooks";
import { useAuthStore } from "@/lib/authStore";

const PRIVILEGED_ROLES = ["ADMIN", "PLANNER", "ENGINEER", "RESEARCHER"];

const CORE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets/roads", label: "Roads", icon: Route },
  { href: "/assets/bridges", label: "Bridges", icon: Landmark },
  { href: "/assets/transit", label: "Transit", icon: TrainFront },
  { href: "/map", label: "GIS Map", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const isPrivileged = !!user && PRIVILEGED_ROLES.includes(user.role);

  const NAV = [
    ...CORE_NAV,
    { href: "/portal/report", label: "Report Issue", icon: FilePlus2 },
    { href: "/portal/my-reports", label: "My Reports", icon: MessageSquareWarning },
    ...(isPrivileged ? [{ href: "/complaints", label: "Complaints", icon: MessageSquareWarning }] : []),
    ...(isPrivileged ? [{ href: "/maintenance", label: "Maintenance", icon: Wrench }] : []),
    ...(isPrivileged ? [{ href: "/inspections", label: "Inspections", icon: ClipboardCheck }] : []),
    ...(isPrivileged ? [{ href: "/predictions", label: "AI Predictions", icon: BrainCircuit }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-surface-900">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-surface-900/80 backdrop-blur-sm">
        {/* Logo area */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 shadow-lg shadow-primary-500/25">
            <Route className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">HuMsafar</h1>
            <div className="flex items-center gap-1 text-[10px] text-emerald">
              <Activity className="h-2.5 w-2.5" /> Platform Active
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <span className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</span>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "nav-link-active bg-gradient-to-r from-primary-500/10 to-accent-400/5 text-primary-300"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary-400" : "text-slate-500 group-hover:text-slate-400")} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-primary-500/50" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-400/20 text-xs font-bold text-primary-300">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400/70 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface-900 p-8">
        {children}
      </main>
    </div>
  );
}
