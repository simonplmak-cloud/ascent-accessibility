import type { Conformance } from "./types";
import { Disclosure } from "@/components/ui/disclosure";

const PRINCIPLES: Record<string, string> = {
  "1": "Perceivable",
  "2": "Operable",
  "3": "Understandable",
  "4": "Robust",
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

function resultLabel(result: string): string {
  if (result === "NotPresent") return "not present";
  if (result === "CannotTell") return "cannot tell";
  if (result === "NotChecked") return "not checked";
  return result;
}

export function ConformanceTable({ conformance }: { conformance: Conformance }) {
  if (!conformance?.rows?.length) return null;

  const grouped = new Map<string, typeof conformance.rows>();
  for (const row of conformance.rows) {
    const principle = row.num.split(".")[0] ?? "?";
    const list = grouped.get(principle) ?? [];
    list.push(row);
    grouped.set(principle, list);
  }

  return (
    <section aria-labelledby="conformance-heading" className="mt-8">
      <h2 id="conformance-heading" className="font-mono text-lg font-semibold text-terminal-fg">
        WCAG conformance
      </h2>
      <p className="mt-1 font-mono text-sm text-terminal-muted">
        {conformance.passed} passed · {conformance.failed} failed ·{" "}
        {conformance.notPresent} not present · {conformance.cannotTell} cannot tell ·{" "}
        {conformance.coverage}% tested · level attained:{" "}
        <span className="text-terminal-fg">{conformance.levelAttained}</span>
      </p>

      <div className="mt-4 space-y-2">
        {[...grouped.entries()].map(([principle, rows]) => (
          <Disclosure
            key={principle}
            as="h3"
            size="md"
            title={
              <>
                Principle {principle} — {PRINCIPLES[principle] ?? ""}{" "}
                <span className="font-normal text-terminal-muted">({rows.length})</span>
              </>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-terminal-border text-left text-terminal-muted">
                  <th scope="col" className="px-3 py-2 font-medium">SC</th>
                  <th scope="col" className="px-3 py-2 font-medium">Title</th>
                  <th scope="col" className="px-3 py-2 font-medium">Level</th>
                  <th scope="col" className="px-3 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.num} className="border-b border-terminal-border last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2 text-terminal-fg">{row.num}</td>
                    <td className="px-3 py-2 text-terminal-muted">{row.title}</td>
                    <td className="px-3 py-2 text-terminal-muted">{row.level}</td>
                    <td className="px-3 py-2">
                      <span className={resultClass(row.result)}>{resultLabel(row.result)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
