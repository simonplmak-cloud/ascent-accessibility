import type { AssessmentResult } from "./types";

function conformanceOutcomeLabel(outcome: string | undefined): string {
  if (outcome === "conforms") return "Conforms";
  if (outcome === "does-not-conform") return "Does not conform";
  return "Not yet evaluated";
}

export function ComparisonPanel({ result }: { result: AssessmentResult }) {
  const comparison = result.comparison;
  if (!comparison) return null;

  const audit = comparison.audit;
  const ai = comparison.ai;

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
      <h2 id="comparison-heading" className="font-mono text-lg font-semibold text-terminal-fg">
        Ascent Accessibility analysis
      </h2>
      <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">Signal</th>
              <th scope="col" className="px-3 py-2 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-terminal-border">
              <td className="px-3 py-2 text-terminal-fg">Conformance</td>
              <td className="px-3 py-2 text-terminal-fg">
                {conformanceOutcomeLabel(comparison.conformance?.outcome)}
              </td>
            </tr>
            {typeof audit?.score === "number" && (
              <tr className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">Site audit accessibility</td>
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
            className="font-mono text-sm font-semibold text-terminal-muted"
          >
            Site signals
          </h3>
          <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-terminal-border text-left text-terminal-muted">
                  <th scope="col" className="px-3 py-2 font-medium">Category</th>
                  <th scope="col" className="px-3 py-2 font-medium">Score</th>
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

      {ai && (
        <section aria-labelledby="ai-review-heading" className="mt-6">
          <h3 id="ai-review-heading" className="font-mono text-sm font-semibold text-terminal-muted">
            AI-assisted review ({ai.model})
          </h3>
          {ai.verdicts.length === 0 ? (
            <p className="mt-2 font-mono text-xs text-terminal-muted">
              No machine-untestable items required AI review.
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
              <table className="w-full border-collapse font-mono text-sm">
                <thead>
                  <tr className="border-b border-terminal-border text-left text-terminal-muted">
                    <th scope="col" className="px-3 py-2 font-medium">SC</th>
                    <th scope="col" className="px-3 py-2 font-medium">Verdict</th>
                    <th scope="col" className="px-3 py-2 font-medium">Confidence</th>
                    <th scope="col" className="px-3 py-2 font-medium">Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {ai.verdicts.map((v) => (
                    <tr key={v.sc} className="border-b border-terminal-border last:border-b-0">
                      <td className="px-3 py-2 text-terminal-fg">{v.sc}</td>
                      <td className="px-3 py-2 text-terminal-fg">{v.verdict}</td>
                      <td className="px-3 py-2 text-terminal-fg">{Math.round(v.confidence * 100)}%</td>
                      <td className="px-3 py-2 text-terminal-muted">{v.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-2 font-mono text-xs text-terminal-muted">
        Automated findings are preliminary — full conformance requires manual review.
      </p>
    </section>
  );
}
