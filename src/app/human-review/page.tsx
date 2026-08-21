import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Human review",
  description:
    "Independent human review by a paid workforce of people with lived experience of visual, hearing, and motor disabilities — experts whose first-hand knowledge resolves every success criterion automation cannot decide.",
  alternates: { canonical: "/human-review" },
};

export default function HumanReviewPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Independent human review</PageHeading>
      <MutedText className="mt-4">
        Automation and AI resolve most success criteria. The rest — the criteria that require
        judgement — are where people with disabilities are the experts. Our review workforce is
        made up of people who live with visual, hearing, and motor disabilities, who use the
        assistive technologies these guidelines exist to protect, and who are paid for that
        expertise. Their lived experience is not a checkbox — it is the standard.
      </MutedText>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">
        Why lived experience matters
      </h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        A reviewer who navigates the web with a screen reader notices in seconds what a checklist
        misses — focus order that doesn&apos;t match reading order, alt text that describes the wrong
        thing, a form error that is announced but not actionable. That judgement turns a score into
        an assurance you can defend. We employ reviewers for their expertise and pay them fairly
        for it: their insight is the product, not an afterthought.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">What we review</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Every success criterion the automated engine and AI cannot determine is flagged
        &ldquo;Cannot tell&rdquo;. A reviewer whose own experience matches the barrier resolves it to
        Passed, Failed, or Not present — with a written rationale — against the exact page snapshot
        captured at scan time, so the result is reproducible even if the live site changes.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">What you receive</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        A signed, dated <InlineLink href="/esg">conformance evaluation report</InlineLink>, structured
        like an assurance engagement: scope, evaluators, review process, per-criterion results, a
        conformance claim, and key findings — in-app and as a PDF, with a VPAT/ACR export for
        procurement.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Cost</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Human review is billed per page. For a quote,{" "}
        <InlineLink href="/contact">contact us</InlineLink> with the site URL and the number of pages
        to review.
      </p>
    </PageShell>
  );
}
