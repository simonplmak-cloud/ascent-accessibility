import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Roadmap & changelog",
  description:
    "What Ascent Accessibility has shipped and what is planned next.",
  alternates: { canonical: "/roadmap" },
};

const shipped = [
  "Clean-room Ascent Accessibility rule engine (no third-party scanners).",
  "Version-aware standards: WCAG 2.0 / 2.1 / 2.2 (A/AA/AAA) plus Section 508.",
  "Six-stage conformance pipeline with per-instruction nature taxonomy (100% SC coverage).",
  "AI-assisted review (vision + audio) with a confidence fail-safe.",
  "Conformance outcome (conforms / does not conform / not yet determined) replacing the 0–100 score.",
  "Independent human review by a lived-experience workforce, with a signed, dated conformance evaluation report.",
  "VPAT/ACR export (WCAG / Section 508 / EN 301 549 editions).",
  "ESG & regulatory mapping (GRI, ESRS, SASB, EN 301 549, Section 508, EAA, AODA, BITV).",
  "Per-SC remediation library.",
];

const planned = [
  "Internationalisation — additional languages for the product and report.",
  "CI/CD integration and a public API for programmatic conformance evaluation.",
  "Continuous monitoring and regression alerting across scans.",
  "WCAG 3.0 support once the specification stabilises.",
  "Public benchmark results against the W3C/WAI test suites.",
];

export default function RoadmapPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Roadmap &amp; changelog</PageHeading>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Shipped</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 font-mono text-sm text-terminal-muted">
        {shipped.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Planned</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 font-mono text-sm text-terminal-muted">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="mt-8 font-mono text-sm text-terminal-fg">
        <InlineLink href="/methodology">Methodology</InlineLink> ·{" "}
        <InlineLink href="/validation">How we validate</InlineLink> ·{" "}
        <InlineLink href="/contact">Contact us</InlineLink>
      </p>
    </PageShell>
  );
}
