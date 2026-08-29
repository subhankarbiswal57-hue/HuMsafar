"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useCurrentUser } from "@/lib/authHooks";

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (!accessToken) return null;
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <div className="flex h-screen items-center justify-center text-danger">Access denied for your role.</div>;
  }
  return <>{children}</>;
}
