"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRegister } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Route, ArrowRight, User, Mail, Lock, CheckCircle2 } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const reg = useRegister();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh bg-grid px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 ring-1 ring-emerald/30">
            <CheckCircle2 className="h-8 w-8 text-emerald" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
          <p className="text-sm text-slate-400">We sent a verification link to your inbox. Verify to activate your account, then sign in.</p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-400 transition-colors hover:text-primary-300">
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh bg-grid px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-10 h-64 w-64 rounded-full bg-accent-400/20 blur-[80px]" />
        <div className="absolute bottom-10 -left-20 h-48 w-48 rounded-full bg-primary-500/15 blur-[60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 shadow-lg shadow-primary-500/25">
            <Route className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-slate-400">Citizen accounts get instant access to report issues</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit((d) => reg.mutate(d, { onSuccess: () => setDone(true) }))}>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
                <Input label="First name" className="pl-10" {...register("firstName")} error={errors.firstName?.message} />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
                <Input label="Last name" className="pl-10" {...register("lastName")} error={errors.lastName?.message} />
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
              <Input label="Email" type="email" className="pl-10" {...register("email")} error={errors.email?.message} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-slate-500" />
              <Input label="Password" type="password" placeholder="Min. 8 characters" className="pl-10" {...register("password")} error={errors.password?.message} />
            </div>

            {reg.isError && (
              <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-red-400">
                {(reg.error as any)?.response?.data?.error ?? "Registration failed"}
              </div>
            )}

            <Button type="submit" loading={reg.isPending}>
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-400 transition-colors hover:text-primary-300">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
