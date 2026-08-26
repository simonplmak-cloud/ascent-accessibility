"use client";

import { useTranslations } from "next-intl";
import type { AssessmentResult } from "./types";

export function ComparisonPanel({ result }: { result: AssessmentResult }) {
  const t = useTranslations("report");
  const comparison = result.comparison;
  if (!comparison) return null;

  const audit = comparison.audit;

  function conformanceOutcomeLabel(outcome: string | undefined): string {
    if (outcome === "conforms") return t("conforms");
    if (outcome === "does-not-conform") return t("doesNotConform");
    return t("notYetEvaluated");
  }

  const appendix = (
    [
      ["Performance", audit?.signals?.performance],
      ["SEO", audit?.signals?.seo],
      ["Best Practices", audit?.signals?.bestPractices],
      ["PWA", audit?.signals?.pwa],
    ] as const
  ).filter(([, value]) => typeof value === "number");

  return (
    <section aria-labelledby="comparison-heading" className="mt-8">
      <h2 id="comparison-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("siteSignals")}
      </h2>
      <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thSignal")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thResult")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-terminal-border">
              <td className="px-3 py-2 text-terminal-fg">{t("conformance")}</td>
              <td className="px-3 py-2 text-terminal-fg">
                {conformanceOutcomeLabel(comparison.conformance?.outcome)}
              </td>
            </tr>
            {typeof audit?.score === "number" && (
              <tr className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{t("siteAuditA11y")}</td>
                <td className="px-3 py-2 text-terminal-fg">{audit.score}/100</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {appendix.length > 0 && (
        <section aria-labelledby="site-signals-heading" className="mt-6">
          <h3
            id="site-signals-heading"
            className="font-sans text-sm font-semibold text-terminal-muted"
          >
            {t("siteSignals")}
          </h3>
          <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-terminal-border text-left text-terminal-muted">
                  <th scope="col" className="px-3 py-2 font-medium">{t("thCategory")}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t("thScore")}</th>
                </tr>
              </thead>
              <tbody>
                {appendix.map(([label, value]) => (
                  <tr key={label} className="border-b border-terminal-border last:border-b-0">
                    <td className="px-3 py-2 text-terminal-fg">{label}</td>
                    <td className="px-3 py-2 text-terminal-fg">{value}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-2 font-sans text-xs text-terminal-muted">
        {t("preliminaryNote")}
      </p>
    </section>
  );
}
