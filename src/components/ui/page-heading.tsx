import type { ReactNode } from "react";

export function PageHeading({ children }: { children: ReactNode }) {
  return <h1 className="font-display text-3xl font-bold text-terminal-fg">{children}</h1>;
}
