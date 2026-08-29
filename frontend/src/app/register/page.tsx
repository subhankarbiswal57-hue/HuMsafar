"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRegister } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Card className="max-w-md text-center">
          <h1 className="mb-2 text-xl font-bold">Check your email</h1>
          <p className="text-sm text-gray-500">We sent a verification link to your inbox. Verify to activate your account, then sign in.</p>
          <Link href="/login" className="mt-4 inline-block text-primary hover:underline">Go to sign in</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-gray-500">Citizen accounts get instant access to report issues.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit((d) => reg.mutate(d, { onSuccess: () => setDone(true) }))}>
          <div className="flex gap-3">
            <Input label="First name" {...register("firstName")} error={errors.firstName?.message} />
            <Input label="Last name" {...register("lastName")} error={errors.lastName?.message} />
          </div>
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          {reg.isError && (
            <p className="text-sm text-danger">{(reg.error as any)?.response?.data?.error ?? "Registration failed"}</p>
          )}
          <Button type="submit" loading={reg.isPending}>Create account</Button>
        </form>
        <div className="mt-4 text-sm">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
