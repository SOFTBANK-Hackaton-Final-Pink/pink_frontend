import type { HTMLAttributes } from "react";
import { cn } from "./utils";

type BadgeVariant = "default" | "success" | "error" | "muted";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
    success: "bg-green-50 text-green-700",
    error: "bg-red-50 text-red-700",
    muted: "bg-slate-50 text-slate-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
