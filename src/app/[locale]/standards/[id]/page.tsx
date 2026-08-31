import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { InlineLink } from "@/components/ui/inline-link";
import { getStandard, listStandards, wcagReference } from "@/lib/standards/catalog";
import { scsForStandard } from "@/lib/standards/version";
import { standardName } from "@/lib/standards/standards-locales";
import { understandingHref, isInternalHref } from "@/lib/standards/understanding";
import {
  WCAG_GUIDELINES,
  guidelineName,
  guidelineOf,
  guidelinePrinciple,
  principleName,
  scTitle,
  specUrl,
  type WcagSc,
} from "@/lib/standards/wcag-sc";

export function generateStaticParams() {
  return listStandards().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const standard = getStandard(id);
  return { title: standard ? standardName(id, locale) : "Standards" };
}

const LEVEL_STYLE: Record<string, string> = {
  A: "text-terminal-pass",
  AA: "text-terminal-serious",
  AAA: "text-terminal-moderate",
};

// Fully-expanded detail for one standard: every guideline and SC visible (no
// tabs, no accordions), with a jump-TOC and a back-link.
export default async function StandardDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const standard = getStandard(id);
  if (!standard) notFound();
  const t = await getTranslations("standards");

  const ref = wcagReference(standard);
  const scs = scsForStandard(ref.version, ref.level);

  const byGuideline = new Map<string, WcagSc[]>();
  for (const sc of scs) {
    const g = guidelineOf(sc.num);
    const list = byGuideline.get(g) ?? [];
    list.push(sc);
    byGuideline.set(g, list);
  }

  const principles = [1, 2, 3, 4]
    .map((principle) => ({
      num: principle,
      name: principleName(principle, locale),
      guidelines: WCAG_GUIDELINES.filter(
        (g) => guidelinePrinciple(g.num) === principle && byGuideline.has(g.num),
      ),
    }))
    .filter((p) => p.guidelines.length > 0);

  return (
    <PageShell width="4xl">
      <p>
        <InlineLink href="/standards">← {t("backToStandards")}</InlineLink>
      </p>
      <PageHeading>{standardName(id, locale)}</PageHeading>

      <nav aria-label={t("jump")} className="mt-6">
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {principles.map((p) => (
            <li key={p.num}>
              <a
                href={`#principle-${p.num}`}
                className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand"
              >
                {p.num}. {p.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {principles.map((p) => (
        <section key={p.num} id={`principle-${p.num}`} aria-labelledby={`p-heading-${p.num}`} className="mt-10 scroll-mt-24">
          <h2 id={`p-heading-${p.num}`} className="font-display text-xl font-semibold text-terminal-fg">
            {p.num}. {p.name}
          </h2>
          {p.guidelines.map((g) => (
            <section key={g.num} aria-labelledby={`g-heading-${g.num}`} className="mt-6">
              <h3 id={`g-heading-${g.num}`} className="font-display text-base font-semibold text-terminal-fg">
                {g.num} {guidelineName(g.num, locale)}
              </h3>
              <ul className="mt-2 divide-y divide-terminal-border rounded border border-terminal-border">
                {(byGuideline.get(g.num) ?? []).map((sc) => (
                  <li key={sc.num} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                    <span
                      aria-hidden="true"
                      className={`w-8 font-sans text-xs font-bold ${LEVEL_STYLE[sc.level] ?? "text-terminal-muted"}`}
                    >
                      {sc.level}
                    </span>
                    <a
                      href={specUrl(sc)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
                    >
                      {sc.num}
                      <span className="sr-only">{t("opensNewWindow")}</span>
                    </a>
                    <span className="font-sans text-sm text-terminal-fg">{scTitle(sc.num, locale)}</span>
                    {isInternalHref(understandingHref(sc.num, locale)) ? (
                      <Link
                        href={understandingHref(sc.num, locale)}
                        className="font-sans text-xs text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
                      >
                        {t("understanding")}
                      </Link>
                    ) : (
                      <a
                        href={understandingHref(sc.num, locale)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-xs text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
                      >
                        {t("understanding")}
                        <span className="sr-only">{t("opensNewWindow")}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ))}
    </PageShell>
  );
}
