"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ACCOUNT_MENU } from "@/lib/site/navigation";
import { DisplayPreferences } from "@/components/shell/display-preferences";

// Consolidated account + settings control. One button opens a single pick-list
// that holds (signed-in) account links + display/language/theme + sign-out, or
// (signed-out) sign-in + display/language/theme. Replaces the separate
// preferences gear and account pill in the header.
export function AccountMenu({
  signedIn,
  email,
  onSignOut,
  signingOut,
}: {
  signedIn: boolean;
  email: string | null;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const t = useTranslations("common");
  const tnav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? "account-menu" : undefined}
        aria-label={tnav("account")}
        title={tnav("account")}
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded border border-terminal-border px-2 text-terminal-fg hover:bg-terminal-surface"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden max-w-[10rem] truncate font-sans text-sm sm:inline">
          {signedIn ? (email ?? t("account")) : tnav("signIn")}
        </span>
      </button>

      {open && (
        <div
          id="account-menu"
          className="absolute right-0 top-full z-10 mt-1 w-72 rounded border border-terminal-border bg-terminal-surface p-3"
        >
          {signedIn ? (
            <>
              {email && (
                <p className="truncate px-1 pb-2 font-sans text-xs text-terminal-muted" title={email}>
                  {email}
                </p>
              )}
              <ul className="m-0 list-none p-0">
                {ACCOUNT_MENU.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded px-2 py-2 min-h-11 font-sans text-sm text-terminal-fg hover:bg-terminal-bg"
                    >
                      {tnav(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="block rounded px-2 py-2 min-h-11 font-sans text-sm text-terminal-fg hover:bg-terminal-bg"
            >
              {tnav("signIn")}
            </Link>
          )}

          <div className="my-2 border-t border-terminal-border" />

          <p className="px-1 pb-2 font-sans text-xs uppercase tracking-wider text-terminal-muted">
            {t("displayAndLanguage")}
          </p>
          <DisplayPreferences />

          {signedIn && (
            <>
              <div className="my-2 border-t border-terminal-border" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                disabled={signingOut}
                className="block min-h-11 w-full rounded px-2 py-2 text-left font-sans text-sm text-terminal-fg hover:bg-terminal-bg disabled:opacity-50"
              >
                {signingOut ? t("signingOut") : t("signOut")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
