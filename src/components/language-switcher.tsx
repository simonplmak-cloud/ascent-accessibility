"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  "zh-Hant": "繁體",
  "zh-Hans": "简体",
};

// Language switcher: swaps the active locale while preserving the current path.
// Renders EN / 繁體 / 简体 segmented control.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-0.5 rounded border border-terminal-border p-0.5"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          aria-pressed={loc === locale}
          className={`rounded px-2 py-0.5 font-sans text-xs ${
            loc === locale
              ? "bg-terminal-fg text-terminal-bg"
              : "text-terminal-muted hover:text-terminal-fg"
          }`}
        >
          {LABELS[loc] ?? loc}
        </button>
      ))}
    </div>
  );
}
