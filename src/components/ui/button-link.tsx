import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

// exactOptionalPropertyTypes: React's AnchorHTMLAttributes optional handlers are
// `T` (not `T | undefined`), while rest-spreading produces `T | undefined`.
// next/link's LinkProps rejects that, so we cast to a non-nullable view — the
// runtime spread is correct (React omits undefined handlers).
type SpreadProps = {
  [K in keyof AnchorHTMLAttributes<HTMLAnchorElement>]: NonNullable<
    AnchorHTMLAttributes<HTMLAnchorElement>[K]
  >;
};

const styles = {
  primary:
    "rounded bg-terminal-fg font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious",
  outline:
    "rounded border border-terminal-border font-sans text-sm text-terminal-fg hover:bg-terminal-surface",
};

const sizes = {
  // min-h-11 (44px) satisfies WCAG 2.5.5 Target Size (Enhanced, AAA).
  sm: "px-3 py-1.5 min-h-11",
  md: "px-4 py-2 min-h-11",
  lg: "px-6 py-3 min-h-11",
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
    <Link
      href={href}
      className={`${styles[variant]} ${sizes[size]} ${className}`}
      // React's AnchorHTMLAttributes optional handlers are `T`, not `T | undefined`;
      // rest-spreading them into next/link under exactOptionalPropertyTypes is a
      // known type friction (runtime is correct — undefined handlers are ignored).
      {...(props as unknown as Omit<SpreadProps, "href">)}
    >
      {children}
    </Link>
  );
}
