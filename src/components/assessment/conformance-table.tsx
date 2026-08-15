import type { Conformance } from "./types";

const PRINCIPLES: Record<string, string> = {
  "1": "Perceivable",
  "2": "Operable",
  "3": "Understandable",
  "4": "Robust",
};

function resultClass(result: string): string {
  switch (result) {
    case "pass":
      return "text-terminal-pass";
    case "fail":
      return "text-terminal-fail";
    default:
      return "text-terminal-muted";
  }
}

function resultLabel(result: string): string {
  if (result === "not-tested") return "not tested";
  return result.toUpperCase();
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
        {conformance.passed} pass · {conformance.failed} fail · {conformance.notTested} not
        tested · level attained: <span className="text-terminal-fg">{conformance.levelAttained}</span>
      </p>

      {[...grouped.entries()].map(([principle, rows]) => (
        <div key={principle} className="mt-4">
          <h3 className="font-mono text-sm font-semibold text-terminal-muted">
            Principle {principle} — {PRINCIPLES[principle] ?? ""}
          </h3>
          <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
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
        </div>
      ))}
    </section>
  );
}
