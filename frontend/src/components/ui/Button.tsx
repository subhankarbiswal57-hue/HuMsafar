"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110 active:scale-[0.98]",
      secondary:
        "border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white active:scale-[0.98]",
      danger:
        "bg-gradient-to-r from-danger to-danger-dark text-white shadow-lg shadow-danger/25 hover:shadow-danger/40 hover:brightness-110 active:scale-[0.98]",
      ghost:
        "text-slate-400 hover:bg-white/[0.05] hover:text-white",
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
