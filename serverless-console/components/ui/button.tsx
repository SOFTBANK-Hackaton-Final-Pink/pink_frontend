import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};
type VariantKey = NonNullable<ButtonProps["variant"]>;
type SizeKey = NonNullable<ButtonProps["size"]>;

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<VariantKey, string> = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[#3c5cd6] focus:ring-[var(--ring)]",
    secondary:
      "border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[#def2ff] focus:ring-[var(--ring)]",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
    danger: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[#c52c2c] focus:ring-red-300",
  };
  const sizes: Record<SizeKey, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    lg: "h-11 px-5 text-base",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
