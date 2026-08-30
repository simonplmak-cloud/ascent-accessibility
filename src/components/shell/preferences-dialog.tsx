"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DisplayPreferences } from "@/components/shell/display-preferences";

// Standalone display + language dialog (used in the mobile nav, where a full
// inline pick-list would be cramped). The desktop header instead embeds
// <DisplayPreferences> directly inside the consolidated account pick-list.
export function PreferencesDialog() {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={t("displayAndLanguage")}
        title={t("displayAndLanguage")}
        className="flex min-h-11 min-w-11 items-center justify-center rounded border border-terminal-border text-terminal-fg hover:bg-terminal-surface"
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
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        aria-labelledby={titleId}
        className="w-[min(20rem,calc(100vw-2rem))] rounded border border-terminal-border bg-terminal-surface p-0 text-terminal-fg backdrop:bg-black/50"
      >
        <div className="border-b border-terminal-border px-5 py-4">
          <h2 id={titleId} className="font-display text-base font-semibold text-terminal-fg">
            {t("displayAndLanguage")}
          </h2>
        </div>

        <div className="px-5 py-5">
          <DisplayPreferences />
        </div>

        <div className="flex justify-end border-t border-terminal-border px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            {t("done")}
          </button>
        </div>
      </dialog>
    </>
  );
}
