import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Human review — coming soon",
  description:
    "Independent human review is coming soon. We are building a review workforce in partnership with charities that serve people with visual and hearing disabilities — lived-experience experts who will verify what automation cannot.",
  alternates: { canonical: "/human-review" },
};

export default function HumanReviewPage() {
  return (
    <PageShell width="4xl">
      <p className="inline-block rounded border border-terminal-serious px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-terminal-serious">
        Coming soon
      </p>
      <PageHeading>Independent human review</PageHeading>
      <MutedText className="mt-4">
        Automated scanning and AI-assisted review resolve most success criteria today. The rest —
        the criteria that require judgement — will be verified by people with lived experience of
        disability. We are building that review workforce now, in partnership with charities that
        serve people with visual and hearing disabilities.
      </MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">
        Why lived experience matters
      </h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        A reviewer who navigates the web with a screen reader notices in seconds what a checklist
        misses — focus order that doesn&apos;t match reading order, alt text that describes the wrong
        thing, a form error that is announced but not actionable. That judgement turns a score into
        an assurance you can defend. When the service launches, reviewers will be paid for that
        expertise: their insight is the product, not an afterthought.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">What it will review</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        Every success criterion the automated engine and AI cannot determine is flagged
        &ldquo;Cannot tell&rdquo;. When human review launches, a reviewer whose own experience
        matches the barrier will resolve each one to Passed, Failed, or Not present — with a
        written rationale — against the exact page snapshot captured at scan time, so the result is
        reproducible even if the live site changes.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">What you will receive</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        A signed, dated <InlineLink href="/esg">conformance evaluation report</InlineLink>, structured
        like an assurance engagement: scope, evaluators, review process, per-criterion results, a
        conformance claim, and key findings — in-app and as a PDF, with a VPAT/ACR export for
        procurement.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">In the meantime</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        You can already run a free scan and get a partial, automated result — clearly marked as
        such — with a suggested fix for each issue. Independent human review will complete the
        picture when it launches.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href="/assess">Scan your site free</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Register your interest
        </ButtonLink>
      </div>
    </PageShell>
  );
}
