"use client";

import Link from "next/link";

export function OAuthButtons({ next }: { next?: string }) {
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={`/api/auth/oauth/github${suffix}`}
        className="rounded border border-terminal-border px-4 py-2 text-center font-mono text-sm text-terminal-fg hover:border-terminal-serious"
      >
        Sign in with GitHub
      </Link>
      <Link
        href={`/api/auth/oauth/microsoft${suffix}`}
        className="rounded border border-terminal-border px-4 py-2 text-center font-mono text-sm text-terminal-fg hover:border-terminal-serious"
      >
        Sign in with Microsoft
      </Link>
    </div>
  );
}
