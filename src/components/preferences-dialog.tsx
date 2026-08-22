"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTheme } from "@/lib/use-theme";

type TextSize = "normal" | "large" | "xlarge";

const TEXT_SIZES: Array<{ value: TextSize; labelKey: string }> = [
  { value: "normal", labelKey: "sizeNormal" },
  { value: "large", labelKey: "sizeLarge" },
  { value: "xlarge", labelKey: "sizeXlarge" },
];

const LOCALE_SHORT: Record<string, string> = { en: "EN", "zh-Hant": "繁", "zh-Hans": "简" };
const LOCALE_LABEL_KEY: Record<string, string> = {
  en: "languageEnglish",
  "zh-Hant": "languageZhHant",
  "zh-Hans": "languageZhHans",
};

// Consolidated display + language preferences behind a single quiet control,
// replacing the separate [Aa] dialog and the 3-button language switcher. The
// trigger shows the current locale so the control is identifiable.
export function PreferencesDialog() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<TextSize>("normal");
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={t("displayAndLanguage")}
        title={t("displayAndLanguage")}
        className="rounded border border-terminal-border px-2 py-1 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
      >
        Aa <span className="text-terminal-muted">{LOCALE_SHORT[locale] ?? "EN"}</span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby="prefs-title"
        className="w-[min(20rem,calc(100vw-2rem))] rounded border border-terminal-border bg-terminal-surface p-0 text-terminal-fg backdrop:bg-black/50"
      >
        <div className="border-b border-terminal-border px-5 py-4">
          <h2 id="prefs-title" className="font-display text-base font-semibold text-terminal-fg">
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
