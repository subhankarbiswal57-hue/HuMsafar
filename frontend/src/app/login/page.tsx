"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLogin } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Route, ArrowRight, Lock, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const login = useLogin();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh bg-grid px-4">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-primary-500/20 blur-[80px]" />
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-accent-400/15 blur-[60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 shadow-lg shadow-primary-500/25">
            <Route className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to the Infrastructure Resilience Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit((d) => login.mutate(d))}>
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
              <Input label="Email" type="email" placeholder="you@agency.gov" className="pl-10" {...register("email")} error={errors.email?.message} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
              <Input label="Password" type="password" placeholder="••••••••" className="pl-10" {...register("password")} error={errors.password?.message} />
            </div>

            {login.isError && (
              <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-red-400">
                {(login.error as any)?.response?.data?.error ?? "Login failed. Please try again."}
              </div>
            )}

            <Button type="submit" loading={login.isPending}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Demo accounts */}
          <div className="mt-4 space-y-2">
            <p className="text-center text-xs text-slate-500">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@humsafar.in" },
                { label: "Planner", email: "planner@humsafar.in" },
                { label: "Citizen", email: "citizen@humsafar.in" },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => login.mutate({ email: d.email, password: "demo1234" })}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-primary-400/30 hover:bg-primary-500/10 hover:text-primary-300"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-slate-500 transition-colors hover:text-primary-400">Forgot password?</Link>
          <Link href="/register" className="text-primary-400 transition-colors hover:text-primary-300">Create account →</Link>
        </div>
      </motion.div>
    </div>
  );
}
