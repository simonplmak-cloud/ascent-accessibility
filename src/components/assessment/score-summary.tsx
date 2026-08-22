"use client";

import { useTranslations } from "next-intl";
import type { Finding, Conformance } from "./types";
import { severityCounts } from "./severity";
import { Card } from "@/components/ui/card";

export function ScoreSummary({
  conformance,
  findings,
}: {
  conformance?: Conformance;
  findings: Finding[];
}) {
  const t = useTranslations("report");
  const counts = severityCounts(findings);
  const outcome = conformance?.outcome;
  const scsMet = conformance?.scsMet;
  const scsApplicable = conformance?.scsApplicable;

  function outcomeLabel(outcome: string | undefined): string {
    if (outcome === "conforms") return t("conforms");
    if (outcome === "does-not-conform") return t("doesNotConform");
    return t("notYetEvaluated");
  }

  function outcomeClass(outcome: string | undefined): string {
    if (outcome === "conforms") return "text-terminal-pass";
    if (outcome === "does-not-conform") return "text-terminal-fail";
    return "text-terminal-serious";
  }

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-8">
      <div>
        <p className="font-sans text-xs uppercase text-terminal-muted">{t("outcomeLabel")}</p>
        <p className={`font-display text-2xl font-bold uppercase ${outcomeClass(outcome)}`}>
          {outcomeLabel(outcome)}
        </p>
      </div>
      {scsApplicable != null && (
        <div>
          <p className="font-sans text-xs uppercase text-terminal-muted">{t("conformanceLabel")}</p>
          <p className="font-display text-lg font-semibold text-terminal-fg">
            {t("scsMeet", { met: scsMet ?? 0, applicable: scsApplicable })}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-sans text-sm sm:grid-cols-4">
        <span className="text-terminal-critical">{t("criticalCount", { count: counts.critical })}</span>
        <span className="text-terminal-serious">{t("seriousCount", { count: counts.serious })}</span>
        <span className="text-terminal-moderate">{t("moderateCount", { count: counts.moderate })}</span>
        <span className="text-terminal-muted">{t("minorCount", { count: counts.minor })}</span>
      </div>
    </Card>
  );
}
