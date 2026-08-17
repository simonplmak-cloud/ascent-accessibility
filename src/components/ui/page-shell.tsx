import type { ReactNode } from "react";

const widths = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
} as const;

export function PageShell({
  children,
  width = "3xl",
}: {
  children: ReactNode;
  width?: keyof typeof widths;
}) {
  return <div className={`mx-auto ${widths[width]} px-4 py-16`}>{children}</div>;
}
