import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "How we validate the engine",
  description:
    "How the Ascent Access engine is validated — rule-to-criterion coverage, W3C ACT-rules alignment, and test coverage.",
  alternates: { canonical: "/validation" },
};

const comparison: Array<[string, string, string, string, string, string]> = [
  ["axe-core (open-source)", "✓", "—", "—", "~30–50%", "—"],
  ["Lighthouse", "✓ (uses axe-core)", "—", "—", "~30–50%", "—"],
  ["Enterprise audit services", "✓", "varies", "expert-led (not lived-experience)", "full (manual)", "report, not in-app"],
  ["Ascent Access", "✓", "✓", "✓ lived-experience workforce", "✓ 100%", "✓ signed, in-app + PDF"],
];

export default function ValidationPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>How we validate the engine</PageHeading>
      <MutedText className="mt-4">
        Every success criterion is classified by how it is tested — machine-testable, AI-detectable,
        or manual-only — and the engine links each automated rule to a specific WCAG criterion. The
        rule catalogue is decomposed into atomic, independently testable checks aligned to the W3C
        ACT-rules format.
      </MutedText>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Coverage model</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Three layers cover 100% of success criteria: the clean-room rule engine (machine-testable),
        an AI-assisted review with a confidence fail-safe (AI-detectable), and independent human
        review by people with lived experience (manual-only). No criterion is left unclassified.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Comparison</h2>
      <div className="mt-3 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">Tool</th>
              <th scope="col" className="px-3 py-2 font-medium">Automated</th>
              <th scope="col" className="px-3 py-2 font-medium">AI-assisted</th>
              <th scope="col" className="px-3 py-2 font-medium">Human review</th>
              <th scope="col" className="px-3 py-2 font-medium">SC coverage</th>
              <th scope="col" className="px-3 py-2 font-medium">Conformance report</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row[0]} className="border-b border-terminal-border last:border-b-0">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 ${i === 0 ? "text-terminal-fg" : "text-terminal-muted"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-mono text-xs text-terminal-muted">
        Feature comparison reflects public documentation at the time of writing. The ~30–50% figure
        is the documented automated-testing ceiling for WCAG, not a criticism of any tool.
      </p>

      <p className="mt-8 font-mono text-sm text-terminal-fg">
        <InlineLink href="/methodology">Methodology</InlineLink> ·{" "}
        <InlineLink href="/standards">WCAG success criteria</InlineLink> ·{" "}
        <InlineLink href="/esg">ESG mapping</InlineLink>
      </p>
    </PageShell>
  );
}
