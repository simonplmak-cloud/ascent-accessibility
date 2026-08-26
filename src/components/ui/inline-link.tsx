"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

// Locale-aware inline link: uses the i18n `Link` so internal hrefs keep the
// current locale. A client component because the i18n `Link` relies on the
// NextIntlClientProvider context (available regardless of setRequestLocale).
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
