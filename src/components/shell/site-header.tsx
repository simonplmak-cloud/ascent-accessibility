"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { ACCOUNT_MENU, SITE_SECTIONS, type SiteSection } from "@/lib/site/navigation";
import { PreferencesDialog } from "@/components/shell/preferences-dialog";
import { AccountMenu } from "@/components/shell/account-menu";
import { ButtonLink } from "@/components/ui/button-link";
import { useFocusTrap } from "@/components/ui/focus-trap";
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

export function SiteHeader({ authState }: { authState: HeaderAuthState }) {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [auth, setAuth] = useState<HeaderAuthState>(authState);
  const router = useRouter();
  const { openPalette } = useCommandPalette();
  const navRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useFocusTrap(mobileOpen);

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

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setDropdown(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdown(null);
        if (mobileOpen) {
          setMobileOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

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

  function renderSection(section: SiteSection) {
    const id = `dd-${section.label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <>
        <button
          type="button"
          onClick={() => setDropdown(dropdown === section.label ? null : section.label)}
          aria-expanded={dropdown === section.label}
          aria-controls={dropdown === section.label ? id : undefined}
          className="inline-flex min-h-11 items-center font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
        >
          {t(section.label)} <span aria-hidden="true">▾</span>
        </button>
        {dropdown === section.label && (
          <ul
            id={id}
            className="absolute left-0 top-full z-10 mt-1 w-56 rounded border border-terminal-border bg-terminal-surface p-1"
          >
            {section.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={() => setDropdown(null)}
                  className="block min-h-11 rounded px-3 py-2 font-sans text-sm text-terminal-fg hover:bg-terminal-bg"
                >
                  {t(child.label)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <header className="border-b border-terminal-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
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

        <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <ul className="m-0 flex list-none items-center gap-5 p-0">
            {SITE_SECTIONS.map((section) => (
              <li key={section.label} className="relative">
                {renderSection(section)}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openPalette}
              aria-label={t("search")}
              title={t("search")}
              className="flex min-h-11 min-w-11 items-center justify-center rounded border border-terminal-border text-terminal-fg hover:bg-terminal-surface"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <AccountMenu
              signedIn={auth.signedIn}
              email={auth.email}
              onSignOut={signOut}
              signingOut={signingOut}
            />
            <ButtonLink href="/assess" size="sm" className="flex min-h-11 items-center gap-2">
              <ScanIcon />
              {t("scanYourSite")}
            </ButtonLink>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openPalette}
            aria-label={t("search")}
            title={t("search")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded border border-terminal-border text-terminal-fg hover:bg-terminal-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <AccountMenu
            signedIn={auth.signedIn}
            email={auth.email}
            onSignOut={signOut}
            signingOut={signingOut}
          />
          <ButtonLink href="/assess" size="sm" className="flex min-h-11 items-center gap-2">
            <ScanIcon />
            {t("scanYourSite")}
          </ButtonLink>
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? "mobile-nav" : undefined}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded border border-terminal-border p-2 text-terminal-fg"
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
              {mobileOpen ? (
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
      </div>

      {mobileOpen && (
        <nav
          ref={mobileNavRef}
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-terminal-border md:hidden"
        >
          <ul className="m-0 list-none p-0">
            {SITE_SECTIONS.map((section) => (
              <li key={section.label} className="border-b border-terminal-border/40 px-4 py-2">
                <p className="font-sans text-xs uppercase tracking-wider text-terminal-muted">
                  {t(section.label)}
                </p>
                <ul className="m-0 list-none p-0">
                  {section.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block min-h-11 px-2 py-2 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
                      >
                        {t(child.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}

            <li className="flex items-center justify-between px-4 py-3">
              <span className="font-sans text-sm text-terminal-muted">{t("display")}</span>
              <PreferencesDialog />
            </li>

            {auth.signedIn ? (
              <>
                {ACCOUNT_MENU.map((item) => (
                  <li key={item.href} className="border-b border-terminal-border/40">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block min-h-11 px-4 py-3 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
                <li className="p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void signOut();
                    }}
                    disabled={signingOut}
                    className="block min-h-11 w-full rounded border border-terminal-border px-4 py-2 text-center font-sans text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-50"
                  >
                    {signingOut ? `${t("signOut")}…` : t("signOut")}
                  </button>
                </li>
              </>
            ) : (
              <li className="p-4">
                <ButtonLink
                  href="/sign-in"
                  variant="outline"
                  className="block text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("signIn")}
                </ButtonLink>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
