import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { listStandards, type Standard } from "@/lib/standards/catalog";
import { scsForStandard } from "@/lib/standards/version";
import {
  specUrl,
  understandingUrl,
  type WcagSc,
} from "@/lib/standards/wcag-sc";

export const metadata: Metadata = {
  title: "WCAG success criteria",
  description:
    "The success criteria the assessment tool scores against — WCAG 2.0, 2.1, 2.2, and Section 508 — with links to the specification and Understanding documents.",
  alternates: { canonical: "/standards" },
};

const LEVEL_STYLE: Record<string, string> = {
  A: "text-terminal-pass",
  AA: "text-terminal-serious",
  AAA: "text-terminal-moderate",
};

function scsFor(standard: Standard): WcagSc[] {
  if (standard.version === "508") {
    // Section 508 maps to WCAG 2.0 AA.
    return scsForStandard("2.0", "AA");
  }
  return scsForStandard(standard.version, standard.level ?? "AA");
}

function ScList({ scs }: { scs: WcagSc[] }) {
  return (
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
  );
}

export default function StandardsPage() {
  const standards = listStandards();

  return (
    <PageShell width="4xl">
      <PageHeading>WCAG success criteria</PageHeading>
      <MutedText className="mt-4">
        Every success criterion the assessment tool scores against, across WCAG 2.0, 2.1, 2.2 and
        Section 508. The number links to the W3C specification; &ldquo;Understanding&rdquo; links to the
        official explanatory document.
      </MutedText>

      {standards.map((standard) => (
        <section key={standard.id} aria-labelledby={`s-${standard.id}`} className="mt-10">
          <h2 id={`s-${standard.id}`} className="font-mono text-xl font-semibold text-terminal-fg">
            {standard.name}
            {standard.version === "508" && (
              <span className="font-mono text-sm font-normal text-terminal-muted">
                {" "}
                (maps to WCAG 2.0 AA)
              </span>
            )}
          </h2>
          <ScList scs={scsFor(standard)} />
        </section>
      ))}

      <p className="mt-10 font-mono text-sm text-terminal-muted">
        Source:{" "}
        <a
          href="https://www.w3.org/TR/WCAG22/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-terminal-fg"
        >
          Web Content Accessibility Guidelines (WCAG)
        </a>{" "}
        by the W3C. Learn how the tool scores against these in{" "}
        <InlineLink href="/methodology">our methodology</InlineLink>.
      </p>
    </PageShell>
  );
}
