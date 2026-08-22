import Link from "next/link";
import { Disclosure } from "@/components/ui/disclosure";
import { aiResults, humanReviewPending, machineResults } from "@/lib/report-methods";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
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
  if (!conformance?.rows?.length) return null;

  const machine = machineResults(conformance.rows);
  const aiRes = aiResults(ai?.verdicts ?? []);
  const human = humanReviewPending(conformance.rows);

  return (
    <section aria-labelledby="review-methods-heading" className="mt-8">
      <h2 id="review-methods-heading" className="font-display text-lg font-semibold text-terminal-fg">
        Results by review method
      </h2>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        How each success criterion was decided — by the machine, by AI, or still needing human
        review. An AI &ldquo;cannot tell&rdquo; is escalated to human review.
      </p>

      <div className="mt-4 space-y-2">
        {/* Machine review */}
        <Disclosure
          as="h3"
          size="md"
          defaultOpen
          title={
            <>
              Machine review (automated){" "}
              <span className="font-normal text-terminal-muted">
                ({machine.passed} passed · {machine.failed} failed)
              </span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            Decided by the rule engine — deterministic, evidence-backed.
          </p>
          <ul className="mt-2 divide-y divide-terminal-border rounded border border-terminal-border">
            {machine.rows.map((row) => (
              <li key={row.num} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                <span className="font-sans text-sm text-terminal-fg">{row.num}</span>
                <span className="font-sans text-sm text-terminal-muted">{row.title}</span>
                <span className="ml-auto font-sans text-xs text-terminal-muted">Level {row.level}</span>
                <span className={`font-sans text-xs font-semibold ${verdictClass(row.machineResult ?? "")}`}>
                  {row.machineResult}
                </span>
              </li>
            ))}
            {machine.rows.length === 0 && (
              <li className="px-3 py-2 font-sans text-sm text-terminal-muted">
                No criteria were decided by the machine for this page.
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
              AI-assisted review{" "}
              <span className="font-normal text-terminal-muted">
                ({aiRes.passed} passed · {aiRes.failed} failed · {aiRes.cannotTell} cannot tell)
              </span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            AI-assisted triage — not proof of conformance. Criteria below the confidence threshold
            remain flagged for human review.
          </p>
          {aiRes.verdicts.length === 0 ? (
            <p className="mt-2 font-sans text-sm text-terminal-muted">
              No machine-untestable criteria required AI review for this page.
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded border border-terminal-border">
              <table className="w-full border-collapse font-sans text-sm">
                <thead>
                  <tr className="border-b border-terminal-border text-left text-terminal-muted">
                    <th scope="col" className="px-3 py-2 font-medium">SC</th>
                    <th scope="col" className="px-3 py-2 font-medium">Verdict</th>
                    <th scope="col" className="px-3 py-2 font-medium">Confidence</th>
                    <th scope="col" className="px-3 py-2 font-medium">Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {aiRes.verdicts.map((v) => (
                    <tr key={v.sc} className="border-b border-terminal-border last:border-b-0">
                      <td className="px-3 py-2 text-terminal-fg">{v.sc}</td>
                      <td className="px-3 py-2">
                        <span className={verdictClass(v.verdict)}>{v.verdict}</span>
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
              Human review (pending — coming soon){" "}
              <span className="font-normal text-terminal-muted">({human.count} criteria)</span>
            </>
          }
        >
          <p className="font-sans text-xs text-terminal-muted">
            These criteria cannot be verified automatically or by AI — they need human judgement.
            Independent human review by people with lived experience of disability is coming soon.
          </p>
          <ul className="mt-2 space-y-3">
            {human.rows.map((row) => (
              <li key={row.num} className="rounded border border-terminal-border p-3">
                <p className="font-sans text-sm text-terminal-fg">
                  <span className="font-semibold">{row.num} {row.title}</span>{" "}
                  <span className="text-terminal-muted">(Level {row.level})</span>
                </p>
                <p className="mt-1 font-sans text-sm text-terminal-muted">{getManualTest(row.num)}</p>
              </li>
            ))}
            {human.rows.length === 0 && (
              <li className="rounded border border-terminal-border p-3 font-sans text-sm text-terminal-muted">
                Nothing needs human review for this page.
              </li>
            )}
          </ul>
          <p className="mt-3">
            <Link
              href="/human-review"
              className="font-sans text-sm text-brandLink underline underline-offset-4 hover:text-brand"
            >
              Human review — coming soon
            </Link>
          </p>
        </Disclosure>
      </div>
    </section>
  );
}
