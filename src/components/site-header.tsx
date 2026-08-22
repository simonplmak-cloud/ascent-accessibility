"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { ACCOUNT_MENU, PRIMARY_NAV, type NavItem } from "@/lib/navigation";
import { PreferencesDialog } from "@/components/preferences-dialog";
import { AccountMenu } from "@/components/account-menu";
import { ButtonLink } from "@/components/ui/button-link";

export interface HeaderAuthState {
  signedIn: boolean;
  email: string | null;
}

export function SiteHeader({ authState }: { authState: HeaderAuthState }) {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setDropdown(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdown(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  function renderItem(item: NavItem) {
    if (!item.children) {
      return (
        <Link
          href={item.href!}
          className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
        >
          {t(item.label)}
        </Link>
      );
    }
    const id = `dd-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <>
        <button
          type="button"
          onClick={() => setDropdown(dropdown === item.label ? null : item.label)}
          aria-expanded={dropdown === item.label}
          aria-controls={id}
          className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
        >
          {t(item.label)} <span aria-hidden="true">▾</span>
        </button>
        {dropdown === item.label && (
          <ul
            id={id}
            className="absolute left-0 top-full z-10 mt-1 w-48 rounded border border-terminal-border bg-terminal-surface p-1"
          >
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={() => setDropdown(null)}
                  className="block rounded px-3 py-2 font-sans text-sm text-terminal-fg hover:bg-terminal-bg"
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
            src="/images/apf-logo.png"
            alt="Ascent Partners Foundation"
            width={222}
            height={87}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <ul className="m-0 flex list-none items-center gap-5 p-0">
            {PRIMARY_NAV.map((item) => (
              <li key={item.label} className="relative">
                {renderItem(item)}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <PreferencesDialog />
            {authState.signedIn ? (
              <AccountMenu email={authState.email} onSignOut={signOut} signingOut={signingOut} />
            ) : (
              <ButtonLink href="/sign-in" variant="outline" size="sm">
                {t("signIn")}
              </ButtonLink>
            )}
            <ButtonLink href="/assess" size="sm">
              {t("scanYourSite")}
            </ButtonLink>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <PreferencesDialog />
          <ButtonLink href="/assess" size="sm">
            {t("scanYourSite")}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            className="rounded border border-terminal-border p-2 text-terminal-fg"
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
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-terminal-border md:hidden">
          <ul className="m-0 list-none p-0">
            {PRIMARY_NAV.map((item) =>
              item.children ? (
                <li key={item.label} className="border-b border-terminal-border/40 px-4 py-2">
                  <p className="font-sans text-xs uppercase tracking-wider text-terminal-muted">
                    {t(item.label)}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-2 py-2 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
                        >
                          {t(child.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.label} className="border-b border-terminal-border/40">
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
                  >
                    {t(item.label)}
                  </Link>
                </li>
              ),
            )}

            <li className="flex items-center justify-between px-4 py-3">
              <span className="font-sans text-sm text-terminal-muted">{t("display")}</span>
              <PreferencesDialog />
            </li>

            {authState.signedIn ? (
              <>
                {ACCOUNT_MENU.map((item) => (
                  <li key={item.href} className="border-b border-terminal-border/40">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
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
                    className="block w-full rounded border border-terminal-border px-4 py-2 text-center font-sans text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-50"
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
