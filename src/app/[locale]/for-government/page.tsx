import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "For government",
  description:
    "Independent accessibility verification for government digital and policy teams — meet WCAG AA mandates with evidence, not just a self-declared statement. Free to start.",
  alternates: { canonical: "/for-government" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default function ForGovernmentPage() {
  return (
    <PageShell width="3xl">
      <PageHeading>Accessibility assurance for government</PageHeading>
      <MutedText className="mt-4">
        For digital and policy teams who must show — not just say — that public websites are
        accessible to everyone.
      </MutedText>

      <Section title="The requirement">
        <p>
          Public-sector websites are expected to meet WCAG Level AA. That is the standard behind
          Hong Kong&rsquo;s digital-government guidelines, Section 508 in the United States,
          EN 301 549 in Europe, and the European Accessibility Act. Citizens have a right to
          access public information and services — whatever their disability.
        </p>
      </Section>

      <Section title="Why a self-declared statement is not enough">
        <p>
          Anyone can publish a conformance claim. What stands up to scrutiny is independent,
          evidence-based verification: a signed, dated report that shows exactly which success
          criteria pass, which fail, and which needed human review — with the evidence to back
          each one. That is what auditors, ombudsmen, and procurement teams ask for.
        </p>
      </Section>

      <Section title="What you get">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">A clear baseline</span> — automated scanning across
            WCAG 2.0, 2.1, 2.2 and Section 508, mapped to EN 301 549.
          </li>
          <li>
            <span className="text-terminal-fg">Prioritised findings</span> — the top issues to fix
            first, each with a suggested fix and the evidence.
          </li>
          <li>
            <span className="text-terminal-fg">Independent human review (coming soon)</span> —
            people with lived experience of disability will confirm what automation cannot.
          </li>
          <li>
            <span className="text-terminal-fg">A signed, dated report</span> — an auditable record
            for governance, procurement, and public accountability.
          </li>
        </ul>
      </Section>

      <Section title="Why you can trust it">
        <p>
          We hold ourselves to the same standard — this site targets WCAG 2.2 AAA. Our method is
          open (<InlineLink href="/methodology">methodology</InlineLink>) and our engine is
          documented (<InlineLink href="/validation">how we validate it</InlineLink>). Human review
          (launching soon) will be done by paid experts with lived experience of disability — not a
          token check.
        </p>
      </Section>

      <Section title="Get started">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/human-review" variant="outline">
            Human review — coming soon
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
