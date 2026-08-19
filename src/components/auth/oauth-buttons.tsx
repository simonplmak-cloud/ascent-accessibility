"use client";

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
    // A plain anchor, not next/link: the OAuth start route returns a 307 to the
    // provider, which a client-side <Link> transition does not follow.
    <a
      href={`/api/auth/oauth/${provider}${suffix}`}
      className="rounded border border-terminal-border px-4 py-2 text-center font-mono text-sm text-terminal-fg hover:border-terminal-serious"
    >
      {label}
    </a>
  );
}
