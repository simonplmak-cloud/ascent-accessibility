"use client";

import Link from "next/link";

export function OAuthLinkButton({
  provider,
  label,
  next,
}: {
  provider: string;
  label: string;
  next?: string;
}) {
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <Link
      href={`/api/auth/oauth/${provider}${suffix}`}
      className="rounded border border-terminal-border px-4 py-2 text-center font-mono text-sm text-terminal-fg hover:border-terminal-serious"
    >
      {label}
    </Link>
  );
}
