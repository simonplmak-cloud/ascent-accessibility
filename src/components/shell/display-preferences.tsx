"use client";

import { useEffect, useId, useState } from "react";
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

// Shared display + language + text-size + theme controls, used both inside the
// consolidated account pick-list (header) and the standalone preferences dialog
// (mobile). Language changes navigate in place; text-size and theme persist.
export function DisplayPreferences() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [size, setSize] = useState<TextSize>("normal");
  const { theme, setTheme } = useTheme();
  const sizeGroup = useId();
  const themeGroup = useId();

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

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="font-sans text-sm font-semibold text-terminal-fg">{t("language")}</legend>
        <div className="mt-2 space-y-1">
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
                name={sizeGroup}
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
                name={themeGroup}
                checked={theme === option}
                onChange={() => setTheme(option)}
              />
              {option === "dark" ? t("themeDark") : t("themeLight")}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
