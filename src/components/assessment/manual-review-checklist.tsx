"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import type { Conformance } from "./types";

export function ManualReviewChecklist({ conformance }: { conformance: Conformance }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const rows = conformance?.rows?.filter((row) => row.result === "CannotTell") ?? [];
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="manual-review-heading" className="mt-8">
      <h2 id="manual-review-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("cannotTell", { count: rows.length })}
      </h2>
      <p className="mt-1 font-sans text-sm text-terminal-muted">{t("cannotTellBody")}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.num} className="rounded border border-terminal-border bg-terminal-surface/40 p-3">
            <p className="font-sans text-sm text-terminal-fg">
              <span className="font-semibold">
                {row.num} {row.title}
              </span>{" "}
              <span className="text-terminal-muted">{t("levelLabel", { level: row.level })}</span>
            </p>
            <p className="mt-1 font-sans text-sm text-terminal-muted">{getManualTest(row.num, locale)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link
          href="/human-review"
          className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
        >
          {t("humanReviewComingSoon")}
        </Link>
      </p>
    </section>
  );
}
