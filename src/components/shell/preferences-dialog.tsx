"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTheme } from "@/lib/site/use-theme";

type TextSize = "normal" | "large" | "xlarge";

const TEXT_SIZES: Array<{ value: TextSize; labelKey: string }> = [
  { value: "normal", labelKey: "sizeNormal" },
  { value: "large", labelKey: "sizeLarge" },
  { value: "xlarge", labelKey: "sizeXlarge" },
];

const LOCALE_LABEL_KEY: Record<string, string> = {
  en: "languageEnglish",
  "zh-Hant": "languageZhHant",
  "zh-Hans": "languageZhHans",
};

// Consolidated display + language preferences behind a single quiet control,
// replacing the separate [Aa] dialog and the 3-button language switcher. The
// trigger is a settings-gear icon button, matching the header search button.
export function PreferencesDialog() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<TextSize>("normal");
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const saved = localStorage.getItem("text-size") as TextSize | null;
    if (saved && TEXT_SIZES.some((s) => s.value === saved)) setSize(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textSize = size;
    try {
      localStorage.setItem("text-size", size);
    } catch {
      // Preference applies for the session even if storage is unavailable.
    }
  }, [size]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

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

        <div className="space-y-5 px-5 py-5">
          <fieldset>
            <legend className="font-sans text-sm font-semibold text-terminal-fg">{t("language")}</legend>
            <div className="mt-2 space-y-2">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => switchLocale(loc)}
                  aria-pressed={loc === locale}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left font-sans text-sm ${
                    loc === locale
                      ? "bg-terminal-fg text-terminal-bg"
                      : "text-terminal-fg hover:bg-terminal-bg"
                  }`}
                >
                  {t(LOCALE_LABEL_KEY[loc] ?? "languageEnglish")}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-sans text-sm font-semibold text-terminal-fg">{t("textSize")}</legend>
            <div className="mt-2 space-y-2">
              {TEXT_SIZES.map((option) => (
                <label key={option.value} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                  <input
                    type="radio"
                    name="pref-text-size"
                    checked={size === option.value}
                    onChange={() => setSize(option.value)}
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-sans text-sm font-semibold text-terminal-fg">{t("theme")}</legend>
            <div className="mt-2 space-y-2">
              {(["dark", "light"] as const).map((option) => (
                <label key={option} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                  <input
                    type="radio"
                    name="pref-theme"
                    checked={theme === option}
                    onChange={() => setTheme(option)}
                  />
                  {option === "dark" ? t("themeDark") : t("themeLight")}
                </label>
              ))}
            </div>
          </fieldset>
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
