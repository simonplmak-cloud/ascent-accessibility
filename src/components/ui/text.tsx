import type { HTMLAttributes } from "react";

export function MutedText({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`font-sans leading-7 text-terminal-muted ${className}`} {...props} />
  );
}
