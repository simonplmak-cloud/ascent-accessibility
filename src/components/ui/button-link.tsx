import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

const styles = {
  primary:
    "rounded bg-terminal-fg font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious",
  outline:
    "rounded border border-terminal-border font-sans text-sm text-terminal-fg hover:bg-terminal-surface",
};

const sizes = {
  sm: "px-3 py-1",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  variant?: keyof typeof styles;
  size?: keyof typeof sizes;
}) {
  return (
    <Link href={href} className={`${styles[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
