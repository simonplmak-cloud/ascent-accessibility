import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

const styles = {
  primary:
    "rounded bg-terminal-fg font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious",
  outline:
    "rounded border border-terminal-border font-mono text-sm text-terminal-fg hover:bg-terminal-surface",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  variant?: keyof typeof styles;
}) {
  return (
    <Link href={href} className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
