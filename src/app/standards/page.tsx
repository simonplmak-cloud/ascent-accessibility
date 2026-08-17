import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import {
  WCAG_SCS,
  principleName,
  specUrl,
  understandingUrl,
} from "@/lib/standards/wcag-sc";

export const metadata: Metadata = {
  title: "WCAG 2.2 success criteria",
  description:
    "The complete WCAG 2.2 success criteria reference — every criterion grouped by principle and conformance level, with links to the specification and Understanding documents.",
  alternates: { canonical: "/standards" },
};

const LEVEL_STYLE: Record<string, string> = {
  A: "text-terminal-pass",
  AA: "text-terminal-serious",
  AAA: "text-terminal-moderate",
};

export default function StandardsPage() {
  const principles = [1, 2, 3, 4] as const;

  return (
    <PageShell width="4xl">
      <PageHeading>WCAG 2.2 success criteria</PageHeading>
      <MutedText className="mt-4">
        Every success criterion in WCAG 2.2, grouped by principle and conformance level.
        The number links to the W3C specification; &ldquo;Understanding&rdquo; links to the
        official explanatory document. This is the same catalogue the assessment tool
        scores against.
      </MutedText>

      {principles.map((principle) => {
        const scs = WCAG_SCS.filter((sc) => sc.principle === principle);
        return (
          <section key={principle} aria-labelledby={`p-${principle}`} className="mt-10">
            <h2 id={`p-${principle}`} className="font-mono text-xl font-semibold text-terminal-fg">
              {principle}. {principleName(principle)}
            </h2>
            <ul className="mt-3 divide-y divide-terminal-border rounded border border-terminal-border">
              {scs.map((sc) => (
                <li key={sc.num} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                  <span
                    aria-hidden="true"
                    className={`w-8 font-mono text-xs font-bold ${LEVEL_STYLE[sc.level] ?? "text-terminal-muted"}`}
                  >
                    {sc.level}
                  </span>
                  <a
                    href={specUrl(sc)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
                  >
                    {sc.num}
                    <span className="sr-only"> (opens in a new window)</span>
                  </a>
                  <span className="font-mono text-sm text-terminal-fg">{sc.title}</span>
                  <a
                    href={understandingUrl(sc)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
                  >
                    Understanding<span className="sr-only"> (opens in a new window)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-10 font-mono text-sm text-terminal-muted">
        Source:{" "}
        <a
          href="https://www.w3.org/TR/WCAG22/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-terminal-fg"
        >
          Web Content Accessibility Guidelines (WCAG) 2.2
        </a>{" "}
        by the W3C. Learn how the tool scores against these in{" "}
        <InlineLink href="/methodology">our methodology</InlineLink>.
      </p>
    </PageShell>
  );
}
