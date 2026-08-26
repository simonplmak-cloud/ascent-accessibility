"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { standardName } from "@/lib/standards/standards-locales";
import type { AssessmentResult } from "./types";

export function Methodology({ result }: { result: AssessmentResult }) {
  const t = useTranslations("report");
  const locale = useLocale();
  return (
    <section aria-labelledby="methodology-heading" className="mt-8">
      <h2 id="methodology-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("methodologyHeading")}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 font-sans text-sm text-terminal-muted">
        <li>{t("engineLine")}</li>
        <li>{t("standardLine", { standard: standardName(result.standard ?? "wcag22aa", locale) })}</li>
        <li>{t("pagesScannedLine", { count: result.pagesScanned })}</li>
        <li>{t("renderedLine")}</li>
        <li>{t("findingsChainLine")}</li>
        <li>{t("reproducibleLine")}</li>
      </ul>
      <p className="mt-3 font-sans text-sm text-terminal-muted">
        {t("readTheFull")}{" "}
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">
          {t("methodologyLink")}
        </Link>
        ,{" "}
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">
          {t("howWeValidate")}
        </Link>
        , {t("andWord")}{" "}
        <Link href="/human-review" className="text-brandLink underline underline-offset-4 hover:text-brand">
          {t("independentHumanReview")}
        </Link>
        .
      </p>
    </section>
  );
}
