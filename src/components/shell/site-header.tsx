"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { PRIMARY_NAV, ACCOUNT_MENU } from "@/lib/site/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { useCommandPalette } from "@/components/efficiency/keyboard-provider";

export interface HeaderAuthState {
  signedIn: boolean;
  email: string | null;
}

function ScanIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="11" cy="11" r="5" />
      <line x1="15" y1="15" x2="19" y2="19" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Flat, labelled header: no dropdowns, no hamburger, no icon-only controls. The
// primary nav is a visible flat list; account links and search are visible text.
export function SiteHeader({ authState }: { authState: HeaderAuthState }) {
  const t = useTranslations("nav");
  const [signingOut, setSigningOut] = useState(false);
  const [auth, setAuth] = useState<HeaderAuthState>(authState);
  const router = useRouter();
  const { openPalette } = useCommandPalette();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { user?: { email?: string } | null }) => {
        if (cancelled) return;
        setAuth({
          signedIn: Boolean(data.user),
          email: data.user?.email ?? null,
        });
      })
      .catch(() => {
        /* degrade to signed-out */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      setAuth({ signedIn: false, email: null });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-terminal-border">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Link href="/" aria-label={t("home")} className="flex shrink-0 items-center">
            <Image
              src="/images/apf-logo-reverse.webp"
              alt="Ascent Partners Foundation"
              width={222}
              height={87}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={openPalette}
              className="inline-flex min-h-11 items-center gap-2 rounded border border-terminal-border px-3 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
            >
              <SearchIcon />
              {t("search")}
            </button>

            {auth.signedIn ? (
              <>
                {ACCOUNT_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
                  >
                    {t(item.label)}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  disabled={signingOut}
                  className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {signingOut ? `${t("signOut")}…` : t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/settings"
                  className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
                >
                  {t("settings")}
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
                >
                  {t("signIn")}
                </Link>
              </>
            )}

            <ButtonLink href="/assess" size="sm" className="flex min-h-11 items-center gap-2">
              <ScanIcon />
              {t("scanYourSite")}
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
