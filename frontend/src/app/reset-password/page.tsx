"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useResetPassword } from "@/lib/authHooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const schema = z.object({ password: z.string().min(8, "Minimum 8 characters") });

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const reset = useResetPassword();
  const [done, setDone] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <h1 className="mb-1 text-xl font-bold">Set new password</h1>
      {done ? (
        <div className="mt-4">
          <p className="text-sm text-accent">Password updated. You can now sign in.</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>Go to sign in</Button>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit((d) => reset.mutate({ token, password: d.password }, { onSuccess: () => setDone(true) }))}
        >
          <Input label="New password" type="password" {...register("password")} error={errors.password?.message} />
          {reset.isError && <p className="text-sm text-danger">{(reset.error as any)?.response?.data?.error ?? "Reset failed"}</p>}
          <Button type="submit" loading={reset.isPending}>Update password</Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
