import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "standards" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/standards" },
  };
}

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

export default async function StandardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("standards");
  const standards = listStandards().map(buildTree);

  return (
    <PageShell width="4xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <StandardsView standards={standards} defaultId={DEFAULT_STANDARD_ID} />

      <p className="mt-10 font-sans text-sm text-terminal-muted">
        {t.rich("source", {
          wcag: (chunks) => (
            <a
              href="https://www.w3.org/TR/WCAG22/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-terminal-fg"
            >
              {chunks}
            </a>
          ),
          methodology: (chunks) => <InlineLink href="/methodology">{chunks}</InlineLink>,
        })}
      </p>
    </PageShell>
  );
}
