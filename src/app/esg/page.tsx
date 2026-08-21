import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "ESG & compliance mapping",
  description:
    "How the Ascent Accessibility conformance evaluation report provides evidence aligned to GRI, ESRS, SASB, Disability:IN, and regulatory accessibility obligations.",
  alternates: { canonical: "/esg" },
};

const rows: Array<[string, string]> = [
  ["GRI 405 (Diversity & Equal Opportunity)", "Evidence of inclusion of people with disabilities in products and services."],
  ["GRI 406 (Non-discrimination)", "Accessibility barriers are discrimination risks; the report is mitigation evidence."],
  ["GRI 1 (Foundation)", "Reporting itself should be accessible — our report targets WCAG 2.2 AAA."],
  ["ESRS S1 (Own Workforce)", "S1-12 disability disclosure; our lived-experience review workforce evidences inclusion."],
  ["ESRS S4 (Consumers & End-users)", "Digital accessibility of products and services where material — accessible services are an explicit example."],
  ["IFRS S1 / S2 (ISSB)", "Sustainability-related risk and opportunity disclosure (S2 is climate-only; no accessibility metric)."],
  ["SASB Standards", "Industry-specific metrics; check the applicable sector for customer/accessibility items."],
  ["ILO &lsquo;Putting the I in ESG&rsquo;", "Disability-inclusion indicators for investors."],
  ["Disability:IN — Disability Equality Index", "Digital accessibility is a scored category; the conformance report is the artifact."],
  ["UN SDG 10 / 8 / 9.c", "Reduced inequalities, decent work, and ICT access."],
  ["VPAT / ACR", "The procurement conformance template, exported from the same per-criterion data."],
  ["EAA / EN 301 549 / Section 508 / AODA / BITV", "Substantive legal and technical obligations for which WCAG is the technical basis."],
];

export default function EsgPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>ESG &amp; compliance mapping</PageHeading>
      <MutedText className="mt-4">
        Digital accessibility is the &ldquo;S&rdquo; in ESG. The conformance evaluation report
        provides <strong className="text-terminal-fg">evidence aligned to</strong> the frameworks
        below — it is not a statement of compliance with them, and no framework mandates a single
        WCAG metric.
      </MutedText>

      <div className="mt-8 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">Framework / standard</th>
              <th scope="col" className="px-3 py-2 font-medium">How the report plugs in</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([framework, use]) => (
              <tr key={framework} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{framework}</td>
                <td className="px-3 py-2 text-terminal-muted">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-muted">
        See how the tool evaluates a site in{" "}
        <InlineLink href="/methodology">our methodology</InlineLink>, or the technical basis in{" "}
        <InlineLink href="/validation">how we validate the engine</InlineLink>.
      </p>
    </PageShell>
  );
}
