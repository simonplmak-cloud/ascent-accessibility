import type { AssessmentResult } from "./types";

export function ComparisonPanel({ result }: { result: AssessmentResult }) {
  const comparison = result.comparison;
  if (!comparison) return null;

  const lighthouse = comparison.lighthouse?.score;
  const ibm = comparison.ibm;

  return (
    <section aria-labelledby="comparison-heading" className="mt-8">
      <h2 id="comparison-heading" className="font-mono text-lg font-semibold text-terminal-fg">
        Cross-tool comparison
      </h2>
      <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">Tool</th>
              <th scope="col" className="px-3 py-2 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-terminal-border">
              <td className="px-3 py-2 text-terminal-fg">Ascent Accessibility</td>
              <td className="px-3 py-2 text-terminal-fg">{result.score}/100</td>
            </tr>
            {lighthouse !== undefined && (
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">Lighthouse (comparable)</td>
                <td className="px-3 py-2 text-terminal-fg">{lighthouse}/100</td>
              </tr>
            )}
            {ibm && (
              <tr className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">IBM Equal Access</td>
                <td className="px-3 py-2 text-terminal-muted">
                  {ibm.violation} violations · {ibm.potentialViolation} needs review ·{" "}
                  {ibm.recommendation} recommendations
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-xs text-terminal-muted">
        Automated findings are preliminary — full conformance requires manual review.
      </p>
    </section>
  );
}
