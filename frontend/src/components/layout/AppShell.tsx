"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Route, Landmark, TrainFront, Map, LogOut, MessageSquareWarning, Wrench, ClipboardCheck, FilePlus2, BarChart3, BrainCircuit } from "lucide-react";
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
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold text-primary">Infra Resilience</h1>
          <p className="text-xs text-gray-500">GIS & Asset Platform</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-light hover:text-primary dark:text-gray-200",
                pathname.startsWith(href) && "bg-primary-light text-primary"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
