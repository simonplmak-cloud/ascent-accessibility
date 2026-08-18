import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { WCAG_SCS, principleName } from "@/lib/standards/wcag-sc";
import { getScRemediation } from "@/lib/standards/sc-remediation";

export const metadata: Metadata = {
  title: "Remediation library",
  description:
    "Plain-language fixes for every WCAG success criterion — what to change and how to confirm it is resolved.",
  alternates: { canonical: "/remediation" },
};

const principles = [1, 2, 3, 4] as const;

export default function RemediationPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Remediation library</PageHeading>
      <MutedText className="mt-4">
        Plain-language guidance for fixing each WCAG success criterion. The same guidance appears
        in every finding the assessment tool reports.
      </MutedText>

      {principles.map((principle) => (
        <section key={principle} aria-labelledby={`p-${principle}`} className="mt-10">
          <h2 id={`p-${principle}`} className="font-mono text-xl font-semibold text-terminal-fg">
            {principle}. {principleName(principle)}
          </h2>
          <ul className="mt-3 space-y-3">
            {WCAG_SCS.filter((sc) => sc.principle === principle).map((sc) => (
              <li key={sc.num} className="rounded border border-terminal-border p-3">
                <p className="font-mono text-sm text-terminal-fg">
                  <span className="font-semibold">{sc.num} {sc.title}</span>{" "}
                  <span className="text-terminal-muted">(Level {sc.level})</span>
                </p>
                <p className="mt-1 font-mono text-sm text-terminal-muted">
                  {getScRemediation(sc.num)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
