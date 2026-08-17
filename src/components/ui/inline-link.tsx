import Link from "next/link";
import type { ReactNode } from "react";

export function InlineLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`underline underline-offset-4 hover:text-terminal-fg ${className}`}>
      {children}
    </Link>
  );
}
