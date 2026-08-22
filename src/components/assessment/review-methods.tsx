"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Disclosure } from "@/components/ui/disclosure";
import { aiResults, humanReviewPending, machineResults } from "@/lib/report-methods";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { scTitle } from "@/lib/standards/wcag-sc";
import { verdictLabel } from "@/lib/labels";
import type { ComparisonData, Conformance } from "./types";

function verdictClass(result: string): string {
  if (result === "Passed") return "text-terminal-pass";
  if (result === "Failed") return "text-terminal-fail";
  return "text-terminal-serious";
}

// Transparent three-way breakdown of how each success criterion was decided:
// machine (rule engine), AI-assisted, or still pending human review. The same
// structure is mirrored in the PDF report.
export function ReviewMethods({
  conformance,
  ai,
}: {
  conformance?: Conformance;
  ai?: ComparisonData["ai"];
}) {
  const t = useTranslations("report");
  const locale = useLocale();
  if (!conformance?.rows?.length) return null;

  const machine = machineResults(conformance.rows);
  const aiRes = aiResults(ai?.verdicts ?? []);
  const human = humanReviewPending(conformance.rows);

  return (
    <section aria-labelledby="review-methods-heading" className="mt-8">
      <h2 id="review-methods-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("methodsHeading")}
      </h2>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("methodsIntro")}
      </p>

      <div className="mt-4 space-y-2">
        {/* Machine review */}
        <Disclosure
          as="h3"
          size="md"
          defaultOpen
          title={
            <>
              {t("machineTitle")}{" "}
              <span className="font-normal text-terminal-muted">
                {t("machineSummary", { passed: machine.passed, failed: machine.failed })}
              </span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            {t("machineBody")}
          </p>
          <ul className="mt-2 divide-y divide-terminal-border rounded border border-terminal-border">
            {machine.rows.map((row) => (
              <li key={row.num} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                <span className="font-sans text-sm text-terminal-fg">{row.num}</span>
                <span className="font-sans text-sm text-terminal-muted">{scTitle(row.num, locale)}</span>
                <span className="ml-auto font-sans text-xs text-terminal-muted">{t("levelLabel", { level: row.level })}</span>
                <span className={`font-sans text-xs font-semibold ${verdictClass(row.machineResult ?? "")}`}>
                  {verdictLabel(row.machineResult ?? "", locale)}
                </span>
              </li>
            ))}
            {machine.rows.length === 0 && (
              <li className="px-3 py-2 font-sans text-sm text-terminal-muted">
                {t("machineEmpty")}
              </li>
            )}
          </ul>
        </Disclosure>

        {/* AI-assisted review */}
        <Disclosure
          as="h3"
          size="md"
          title={
            <>
              {t("aiTitle")}{" "}
              <span className="font-normal text-terminal-muted">
                {t("aiSummary", { passed: aiRes.passed, failed: aiRes.failed, cannotTell: aiRes.cannotTell })}
              </span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            {t("aiBody")}
          </p>
          {aiRes.verdicts.length === 0 ? (
            <p className="mt-2 font-sans text-sm text-terminal-muted">
              {t("aiEmpty")}
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="border-b border-terminal-border text-left text-terminal-muted">
                    <th scope="col" className="px-3 py-2 font-medium">{t("thSc")}</th>
                    <th scope="col" className="px-3 py-2 font-medium">{t("thVerdict")}</th>
                    <th scope="col" className="px-3 py-2 font-medium">{t("thConfidence")}</th>
                    <th scope="col" className="px-3 py-2 font-medium">{t("thReasoning")}</th>
                  </tr>
                </thead>
                <tbody>
                  {aiRes.verdicts.map((v) => (
                    <tr key={v.sc} className="border-b border-terminal-border last:border-b-0">
                      <td className="px-3 py-2 text-terminal-fg">{v.sc}</td>
                      <td className="px-3 py-2">
                        <span className={verdictClass(v.verdict)}>{verdictLabel(v.verdict, locale)}</span>
                      </td>
                      <td className="px-3 py-2 text-terminal-fg">{Math.round(v.confidence * 100)}%</td>
                      <td className="px-3 py-2 text-terminal-muted">{v.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Disclosure>

        {/* Human review (pending) */}
        <Disclosure
          as="h3"
          size="md"
          title={
            <>
              {t("humanTitle")}{" "}
              <span className="font-normal text-terminal-muted">{t("humanSummary", { count: human.count })}</span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            {t("humanBody")}
          </p>
          <ul className="mt-2 space-y-3">
            {human.rows.map((row) => (
              <li key={row.num} className="rounded border border-terminal-border p-3">
                <p className="font-sans text-sm text-terminal-fg">
                  <span className="font-semibold">{row.num} {scTitle(row.num, locale)}</span>{" "}
                  <span className="text-terminal-muted">{t("levelLabel", { level: row.level })}</span>
                </p>
                <p className="mt-1 font-sans text-sm text-terminal-muted">{getManualTest(row.num)}</p>
              </li>
            ))}
            {human.rows.length === 0 && (
              <li className="rounded border border-terminal-border p-3 font-sans text-sm text-terminal-muted">
                {t("humanEmpty")}
              </li>
            )}
          </ul>
          <p className="mt-3">
            <Link
              href="/human-review"
              className="font-sans text-sm text-brandLink underline underline-offset-4 hover:text-brand"
            >
              {t("humanComingSoon")}
            </Link>
          </p>
        </Disclosure>
      </div>
    </section>
  );
}
