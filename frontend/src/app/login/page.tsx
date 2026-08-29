"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLogin } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const login = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">Access the Infrastructure Resilience Platform</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit((d) => login.mutate(d))}>
          <Input label="Email" type="email" placeholder="you@agency.gov" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" placeholder="••••••••" {...register("password")} error={errors.password?.message} />
          {login.isError && (
            <p className="text-sm text-danger">
              {(login.error as any)?.response?.data?.error ?? "Login failed"}
            </p>
          )}
          <Button type="submit" loading={login.isPending}>Sign in</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
          <Link href="/register" className="text-primary hover:underline">Create account</Link>
        </div>
      </Card>
    </div>
  );
}
