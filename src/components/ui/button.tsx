import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "rounded bg-terminal-fg font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious disabled:opacity-50",
  outline:
    "rounded border border-terminal-border font-sans text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-50",
  ghost:
    "font-sans text-sm text-terminal-fg underline-offset-4 hover:underline disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
