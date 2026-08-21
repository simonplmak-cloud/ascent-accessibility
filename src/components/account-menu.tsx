"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ACCOUNT_MENU } from "@/lib/navigation";

// Signed-in account control: a button that opens a disclosure dropdown with the
// auditor workspace, API access, account, and sign-out.
export function AccountMenu({
  email,
  onSignOut,
  signingOut,
}: {
  email: string | null;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="account-menu"
        className="max-w-[12rem] truncate rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-surface"
      >
        {email ?? "Account"}
      </button>
      {open && (
        <ul
          id="account-menu"
          className="absolute right-0 top-full z-10 mt-1 w-48 rounded border border-terminal-border bg-terminal-surface p-1"
        >
          {ACCOUNT_MENU.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded px-3 py-2 font-mono text-sm text-terminal-fg hover:bg-terminal-bg"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              disabled={signingOut}
              className="block w-full rounded px-3 py-2 text-left font-mono text-sm text-terminal-fg hover:bg-terminal-bg disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
