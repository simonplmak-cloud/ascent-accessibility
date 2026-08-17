import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded border border-terminal-border bg-terminal-surface ${className}`}
      {...props}
    />
  );
}
