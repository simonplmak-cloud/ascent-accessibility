import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Accessibility glossary",
  description:
    "Plain-language definitions of web accessibility and WCAG terms — written for non-experts in NGOs and government. What each term means and why it matters.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Accessibility glossary</PageHeading>
      <MutedText className="mt-4">
        Plain-language definitions of the terms used on this site and across web accessibility.
        Each one says what it means and why it matters — no jargon. New to accessibility? Start
        with our{" "}
        <InlineLink href="/what-is-accessibility">plain-language introduction</InlineLink>.
      </MutedText>

      <dl className="mt-8 space-y-4">
        {GLOSSARY.map((entry) => (
          <div
            key={entry.term}
            className="rounded border border-terminal-border bg-terminal-surface/40 p-4"
          >
            <dt className="font-display text-base font-semibold text-terminal-fg">{entry.term}</dt>
            <dd className="mt-1 font-sans text-sm text-terminal-muted">{entry.definition}</dd>
            <dd className="mt-1 font-sans text-sm text-terminal-fg">
              <span className="text-terminal-muted">Why it matters: </span>
              {entry.why}
            </dd>
            {entry.href && (
              <dd className="mt-2 font-sans text-sm">
                <Link
                  href={entry.href}
                  className="text-brandLink underline underline-offset-4 hover:text-brand"
                >
                  {entry.hrefLabel ?? "Learn more"} →
                </Link>
              </dd>
            )}
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ButtonLink href="/what-is-accessibility" variant="outline">
          Read the introduction
        </ButtonLink>
        <ButtonLink href="/assess">Scan your site free</ButtonLink>
      </div>
    </PageShell>
  );
}
