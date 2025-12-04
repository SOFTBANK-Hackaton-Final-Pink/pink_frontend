import type { TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-[var(--primary)] focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
