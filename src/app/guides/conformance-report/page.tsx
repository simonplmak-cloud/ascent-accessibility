import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/faq-json-ld";

export const metadata: Metadata = {
  title: "What is a WCAG conformance report?",
  description:
    "A plain-language guide to WCAG conformance reports — what they contain, what 'passes / fails / needs review' means, and how to use them. For NGOs and government.",
  alternates: { canonical: "/guides/conformance-report" },
};

const faqs = [
  {
    q: "Does a good score mean my site is compliant?",
    a: "Not on its own. An automated score covers only part of WCAG. A signed conformance report that includes independent human review (launching soon) is stronger evidence — but even that is a professional opinion, not a legal guarantee.",
  },
  {
    q: "What does 'needs human review' mean?",
    a: "Some criteria cannot be decided by a machine — for example, whether alt text is accurate, or whether content is genuinely understandable. Those need a person to judge them, which is why our report separates 'machine', 'AI', and 'human' results.",
  },
  {
    q: "Who asks for a conformance report?",
    a: "Auditors, ombudsmen, procurement teams, funders, and grant assessors — anyone who needs verifiable evidence rather than a self-declared claim.",
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

export default function ConformanceReportGuide() {
  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <PageHeading>What is a WCAG conformance report?</PageHeading>
      <MutedText className="mt-4">
        A plain-language guide to the document that shows, with evidence, how accessible a
        website is.
      </MutedText>

      <Section title="The short answer">
        <p>
          A WCAG conformance report is the record of an accessibility evaluation. It states which
          standard and level were tested (for example, WCAG 2.2 AA), and for each success
          criterion whether the site passes, fails, is not present, or needs human review — with
          the evidence to back it up.
        </p>
      </Section>

      <Section title="What a good report contains">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">A score and a verdict</span> — where the site
            stands overall.
          </li>
          <li>
            <span className="text-terminal-fg">Per-criterion results</span> — pass, fail, not
            present, or needs review, for every success criterion.
          </li>
          <li>
            <span className="text-terminal-fg">How each was tested</span> — machine, AI, or human
            review, so you can judge the confidence.
          </li>
          <li>
            <span className="text-terminal-fg">Prioritised findings</span> — the top issues to fix
            first, with evidence and a suggested fix.
          </li>
          <li>
            <span className="text-terminal-fg">A signature and date</span> — so the report is an
            auditable record, not a one-off screenshot.
          </li>
        </ul>
      </Section>

      <Section title="Passes, fails, and 'needs review'">
        <p>
          A clean report is not the same as a conformant site. Automated tools only check part of
          WCAG, so an honest report separates what the machine decided from what still needs a
          person. That honesty is exactly what makes a report defensible — it shows you
          investigated rather than assumed.{" "}
          <InlineLink href="/guides/accessibility-audit">Read about audits</InlineLink>.
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

      <Section title="Get your report">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/human-review" variant="outline">
            Signed, independent review
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
