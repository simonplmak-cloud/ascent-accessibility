import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/faq-json-ld";

export const metadata: Metadata = {
  title: "What is an accessibility audit?",
  description:
    "A plain-language guide to accessibility audits — automated vs manual testing, what a good audit covers, and how to read the result. For NGOs and government.",
  alternates: { canonical: "/guides/accessibility-audit" },
};

const faqs = [
  {
    q: "Is an automated scan a full accessibility audit?",
    a: "No. Automated tools catch roughly 30–50% of issues. A credible audit also needs manual testing and, for some criteria, human judgement — which is why we combine automated scanning, AI-assisted review, and independent human review.",
  },
  {
    q: "How long does an accessibility audit take?",
    a: "A single-page automated scan usually finishes in under a minute. A whole-site scan takes longer. A full independent audit with human review is scheduled per page.",
  },
  {
    q: "Do I need to be a developer to run one?",
    a: "No. You can run a free scan with just your web address and get a plain-language report. Developers and auditors can go deeper with the evidence and WCAG references.",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default function AccessibilityAuditGuide() {
  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <PageHeading>What is an accessibility audit?</PageHeading>
      <MutedText className="mt-4">
        A plain-language guide to checking how accessible a website really is — and what a
        trustworthy result looks like.
      </MutedText>

      <Section title="The short answer">
        <p>
          An accessibility audit is a structured check of how well a website works for people
          with disabilities. It measures the site against WCAG (the Web Content Accessibility
          Guidelines) and tells you what passes, what fails, and what needs a closer look.
        </p>
      </Section>

      <Section title="Automated vs manual testing">
        <p>No single method catches everything. A credible audit combines both:</p>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">Method</th>
                <th scope="col" className="px-3 py-2 font-medium">What it is</th>
                <th scope="col" className="px-3 py-2 font-medium">What it catches</th>
                <th scope="col" className="px-3 py-2 font-medium">Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">Automated</td>
                <td className="px-3 py-2">Software scans the page against rules</td>
                <td className="px-3 py-2">Clear, technical issues (~30–50%)</td>
                <td className="px-3 py-2">Cannot judge meaning or context</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">AI-assisted</td>
                <td className="px-3 py-2">AI helps check what automation cannot decide</td>
                <td className="px-3 py-2">Some visual and media issues</td>
                <td className="px-3 py-2">Not proof — a person still confirms</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-terminal-fg">Manual</td>
                <td className="px-3 py-2">A person tests with keyboard and screen reader</td>
                <td className="px-3 py-2">The rest — usability in real use</td>
                <td className="px-3 py-2">Takes time and expertise</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="What a good audit covers">
        <p>
          A credible audit follows a method (WCAG-EM): define the scope, explore the site, choose
          a representative sample of pages, evaluate them against WCAG, and report the outcome
          with evidence. The result should say, for each success criterion, whether it passes,
          fails, is not present, or cannot be decided automatically.
        </p>
      </Section>

      <Section title="How to read the result">
        <p>
          A good report leads with the top issues to fix first — ranked by user impact — with the
          affected element, the WCAG reference, and a suggested fix. It should also be honest
          about its limits: an automated score is a starting point, not a certificate of
          conformance.{" "}
          <InlineLink href="/guides/conformance-report">
            Read about conformance reports
          </InlineLink>
          .
        </p>
      </Section>

      <Section title="Common questions">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-display text-base font-semibold text-terminal-fg">{faq.q}</h3>
              <p className="mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Run a free audit">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/human-review" variant="outline">
            Independent human review
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
