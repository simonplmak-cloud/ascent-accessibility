"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextSizeControl } from "@/components/text-size-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export interface HeaderAuthState {
  signedIn: boolean;
  email: string | null;
}

// Always visible — marketing/content pages.
const baseNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/human-review", label: "Human review" },
  { href: "/esg", label: "ESG mapping" },
  { href: "/validation", label: "Validation" },
  { href: "/learn", label: "Learn" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

// Role-gated — only shown to signed-in users. Anonymous visitors don't see
// History, Site scans, or API access.
const signedInNavItems = [
  { href: "/history", label: "History" },
  { href: "/site", label: "Site scans" },
  { href: "/api-keys", label: "API access" },
];

export function SiteHeader({ authState }: { authState: HeaderAuthState }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const navItems = [
    ...baseNavItems,
    ...(authState.signedIn ? signedInNavItems : []),
  ];

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-terminal-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          aria-label="Ascent Partners Foundation home"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/apf-logo.png"
            alt="Ascent Partners Foundation"
            width={222}
            height={87}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 md:flex">
          <ul className="m-0 flex list-none items-center gap-5 p-0">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <TextSizeControl />
          <ThemeToggle />
          {authState.signedIn ? (
            <Button variant="outline" onClick={signOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          ) : (
            <ButtonLink href="/sign-in" variant="outline">
              Sign in
            </ButtonLink>
          )}
          <ButtonLink href="/assess">Start assessment</ButtonLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded border border-terminal-border p-2 text-terminal-fg md:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-terminal-border md:hidden">
          <ul className="m-0 flex list-none flex-col p-0">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 font-mono text-sm text-terminal-fg hover:bg-terminal-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-sm text-terminal-muted">Text size</span>
              <TextSizeControl />
            </li>
            <li className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-sm text-terminal-muted">Theme</span>
              <ThemeToggle />
            </li>
            <li className="p-4">
              {authState.signedIn ? (
                <Button
                  variant="outline"
                  className="block w-full text-center"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  disabled={signingOut}
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </Button>
              ) : (
                <ButtonLink href="/sign-in" variant="outline" className="block text-center" onClick={() => setOpen(false)}>
                  Sign in
                </ButtonLink>
              )}
            </li>
            <li className="p-4">
              <ButtonLink href="/assess" className="block text-center" onClick={() => setOpen(false)}>
                Start assessment
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
