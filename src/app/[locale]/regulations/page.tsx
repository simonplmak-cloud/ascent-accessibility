import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Regulatory mapping",
  description:
    "How WCAG conformance maps to accessibility regulations and standards — EN 301 549, Section 508, the European Accessibility Act, AODA, and BITV.",
  alternates: { canonical: "/regulations" },
};

const rows: Array<[string, string, string]> = [
  ["EN 301 549 (Europe)", "European harmonised accessibility standard for ICT", "References WCAG 2.1 AA (Table A.1)"],
  ["European Accessibility Act (2019/882)", "EU directive for products and services; applies from 28 June 2025", "Technical basis is EN 301 549 (→ WCAG 2.1 AA)"],
  ["Section 508 (United States)", "US federal procurement accessibility standard (2017 refresh)", "References WCAG 2.0 AA"],
  ["ADA — DOJ web rule (United States)", "US Department of Justice rule for state/local government web content", "References WCAG 2.1 AA"],
  ["AODA (Ontario, Canada)", "Accessibility for Ontarians with Disabilities Act", "References WCAG 2.0 AA"],
  ["BITV 2.0 (Germany)", "German Barrier-free Information Technology Ordinance", "References EN 301 549 (→ WCAG 2.1)"],
  ["UK PSBAR 2018 (United Kingdom)", "Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations", "References WCAG 2.1 AA"],
];

export default function RegulationsPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Regulatory mapping</PageHeading>
      <MutedText className="mt-4">
        WCAG is the technical basis for the accessibility regulations below. Meeting WCAG 2.2 AA
        satisfies the WCAG requirements referenced by most of them; confirm the applicable version
        for your jurisdiction. This page is informational, not legal advice.
      </MutedText>

      <div className="mt-8 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">Regulation / standard</th>
              <th scope="col" className="px-3 py-2 font-medium">Scope</th>
              <th scope="col" className="px-3 py-2 font-medium">WCAG reference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, scope, ref]) => (
              <tr key={name} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{name}</td>
                <td className="px-3 py-2 text-terminal-muted">{scope}</td>
                <td className="px-3 py-2 text-terminal-muted">{ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <InlineLink href="/esg">ESG &amp; reporting mapping</InlineLink> ·{" "}
        <InlineLink href="/human-review">Human review</InlineLink> ·{" "}
        <InlineLink href="/validation">How we validate</InlineLink>
      </p>
    </PageShell>
  );
}
