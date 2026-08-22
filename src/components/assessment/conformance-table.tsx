"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Conformance, ConformanceRow } from "./types";
import { principleName, scTitle } from "@/lib/standards/wcag-sc";
import { verdictLabel } from "@/lib/labels";
import { Disclosure } from "@/components/ui/disclosure";

// A10 provenance: how each criterion was resolved. Machine = the rule engine
// decided it; AI = the AI-assisted review resolved it (not proof of conformance);
// Needs human = only a person can judge it.
function natureOf(row: ConformanceRow): "machine" | "needsHuman" | "ai" | "dash" {
  if (row.machineResult === "Passed" || row.machineResult === "Failed") return "machine";
  if (row.result === "CannotTell") return "needsHuman";
  if (row.result === "Passed" || row.result === "Failed") return "ai";
  return "dash";
}

const NATURE_CLASS: Record<string, string> = {
  machine: "text-terminal-muted",
  needsHuman: "text-terminal-serious",
  ai: "text-terminal-serious",
  dash: "text-terminal-muted",
};

function resultClass(result: string): string {
  switch (result) {
    case "Passed":
      return "text-terminal-pass";
    case "Failed":
      return "text-terminal-fail";
    case "CannotTell":
      return "text-terminal-serious";
    default:
      return "text-terminal-muted";
  }
}

export function ConformanceTable({ conformance }: { conformance: Conformance }) {
  const t = useTranslations("report");
  const locale = useLocale();
  if (!conformance?.rows?.length) return null;

  const grouped = new Map<string, typeof conformance.rows>();
  for (const row of conformance.rows) {
    const principle = row.num.split(".")[0] ?? "?";
    const list = grouped.get(principle) ?? [];
    list.push(row);
    grouped.set(principle, list);
  }

  function natureLabel(nature: string): string {
    if (nature === "machine") return t("machine");
    if (nature === "ai") return t("ai");
    if (nature === "needsHuman") return t("needsHuman");
    return "—";
  }

  return (
    <section aria-labelledby="conformance-heading" className="mt-8">
      <h2 id="conformance-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("conformanceHeading")}
      </h2>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("conformanceSummary", {
          passed: conformance.passed,
          failed: conformance.failed,
          notPresent: conformance.notPresent,
          cannotTell: conformance.cannotTell,
          coverage: conformance.coverage,
          level: conformance.levelAttained,
        })}
      </p>
      <p className="mt-1 font-sans text-xs text-terminal-muted">{t("testedByNote")}</p>

      <div className="mt-4 space-y-2">
        {[...grouped.entries()].map(([principle, rows]) => (
          <Disclosure
            key={principle}
            as="h3"
            size="md"
            title={
              <>
                {t("principleLabel", { principle })} — {principleName(Number(principle), locale)}{" "}
                <span className="font-normal text-terminal-muted">({rows.length})</span>
              </>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-terminal-border text-left text-terminal-muted">
                  <th scope="col" className="px-3 py-2 font-medium">{t("thSc")}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t("thTitle")}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t("thLevel")}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t("thResult")}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{t("thTestedBy")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const nature = natureOf(row);
                  return (
                    <tr key={row.num} className="border-b border-terminal-border last:border-b-0">
                      <td className="whitespace-nowrap px-3 py-2 text-terminal-fg">{row.num}</td>
                      <td className="px-3 py-2 text-terminal-muted">{scTitle(row.num, locale)}</td>
                      <td className="px-3 py-2 text-terminal-muted">{row.level}</td>
                      <td className="px-3 py-2">
                        <span className={resultClass(row.result)}>{verdictLabel(row.result, locale)}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={NATURE_CLASS[nature]}>{natureLabel(nature)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
