import type { HTMLAttributes } from "react";

export function MutedText({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`font-mono leading-7 text-terminal-muted ${className}`} {...props} />
  );
}
