"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) return setStatus("error");
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Card className="w-full max-w-md text-center">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <>
          <h1 className="mb-2 text-xl font-bold text-accent">Email verified</h1>
          <Link href="/login" className="text-primary hover:underline">Sign in now</Link>
        </>
      )}
      {status === "error" && <p className="text-danger">Invalid or expired verification link.</p>}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={null}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
