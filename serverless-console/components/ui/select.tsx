import type { SelectHTMLAttributes } from "react";
import { cn } from "./utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-[var(--primary)] focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
