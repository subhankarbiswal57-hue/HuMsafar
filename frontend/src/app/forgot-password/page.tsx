"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-bold">Reset password</h1>
        <p className="mb-6 text-sm text-gray-500">Enter your account email to receive a reset link.</p>
        {sent ? (
          <p className="text-sm text-accent">If that email exists, a reset link has been sent.</p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit((d) => forgot.mutate(d.email, { onSuccess: () => setSent(true) }))}>
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <Button type="submit" loading={forgot.isPending}>Send reset link</Button>
          </form>
        )}
        <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">Back to sign in</Link>
      </Card>
    </div>
  );
}
