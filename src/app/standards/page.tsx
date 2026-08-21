import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { StandardsView, type StandardTree } from "@/components/standards/standards-view";
import { DEFAULT_STANDARD_ID, listStandards, type Standard } from "@/lib/standards/catalog";
import { scsForStandard } from "@/lib/standards/version";
import {
  WCAG_GUIDELINES,
  guidelineName,
  guidelineOf,
  guidelinePrinciple,
  principleName,
  specUrl,
  understandingUrl,
  type WcagSc,
} from "@/lib/standards/wcag-sc";

export const metadata: Metadata = {
  title: "WCAG success criteria",
  description:
    "The success criteria the assessment tool scores against — WCAG 2.0, 2.1, 2.2, and Section 508 — grouped by principle and guideline, with links to the specification and Understanding documents.",
  alternates: { canonical: "/standards" },
};

function scsFor(standard: Standard): WcagSc[] {
  // Section 508 maps to WCAG 2.0 AA.
  if (standard.version === "508") return scsForStandard("2.0", "AA");
  return scsForStandard(standard.version, standard.level ?? "AA");
}

function buildTree(standard: Standard): StandardTree {
  const byGuideline = new Map<string, WcagSc[]>();
  for (const sc of scsFor(standard)) {
    const guideline = guidelineOf(sc.num);
    const list = byGuideline.get(guideline) ?? [];
    list.push(sc);
    byGuideline.set(guideline, list);
  }

  const principles = [1, 2, 3, 4]
    .map((principle) => {
      const guidelines = WCAG_GUIDELINES.filter(
        (g) => guidelinePrinciple(g.num) === principle && byGuideline.has(g.num),
      );
      return {
        num: principle,
        name: principleName(principle),
        guidelines: guidelines.map((g) => ({
          num: g.num,
          name: guidelineName(g.num),
          scs: byGuideline.get(g.num)!.map((sc) => ({
            num: sc.num,
            title: sc.title,
            level: sc.level,
            specUrl: specUrl(sc),
            understandingUrl: understandingUrl(sc),
          })),
        })),
      };
    })
    .filter((principle) => principle.guidelines.length > 0);

  return {
    id: standard.id,
    name: standard.name,
    version: standard.version,
    principles,
  };
}

export default function StandardsPage() {
  const standards = listStandards().map(buildTree);

  return (
    <PageShell width="4xl">
      <PageHeading>WCAG success criteria</PageHeading>
      <MutedText className="mt-4">
        Every success criterion the assessment tool scores against, grouped by principle and
        guideline. Choose a standard, then expand a guideline. The number links to the W3C
        specification; &ldquo;Understanding&rdquo; links to the official explanatory document.
      </MutedText>

      <StandardsView standards={standards} defaultId={DEFAULT_STANDARD_ID} />

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
