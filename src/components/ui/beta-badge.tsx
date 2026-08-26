"use client";

import { useTranslations } from "next-intl";
import { IS_BETA } from "@/lib/site/branding";

export function BetaBadge({ withDisclaimer = false }: { withDisclaimer?: boolean }) {
  const t = useTranslations("beta");
  if (!IS_BETA) return null;

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex w-fit items-center rounded border border-terminal-serious px-2 py-0.5 font-sans text-xs font-semibold uppercase text-terminal-serious">
        {t("badge")}
      </span>
      {withDisclaimer && (
        <span className="max-w-prose font-sans text-xs text-terminal-muted">{t("disclaimer")}</span>
      )}
    </span>
  );
}
