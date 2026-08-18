import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Human review",
  description:
    "Independent human review by a workforce with lived experience of visual, hearing, and motor disabilities, resolving every success criterion automation cannot decide.",
  alternates: { canonical: "/human-review" },
};

export default function HumanReviewPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Independent human review</PageHeading>
      <MutedText className="mt-4">
        Automated scanning and AI-assisted review resolve most success criteria. The remainder —
        criteria that require human judgement — are verified by our partner review workforce:
        people who live with visual, hearing, and motor disabilities and use the assistive
        technologies the guidelines exist to protect.
      </MutedText>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">What we review</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Every success criterion the automated engine and AI cannot determine is flagged
        &ldquo;Cannot tell&rdquo;. A reviewer with the relevant lived experience resolves each one to
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

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Pricing</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Human review is priced per page. For a quote,{" "}
        <InlineLink href="/contact">contact us</InlineLink> with the site URL and the number of pages
        to review.
      </p>
    </PageShell>
  );
}
