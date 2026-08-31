import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { RelatedLinks } from "@/components/ui/related-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("guideArticles") };
}

// Index of the four in-depth guide articles. Each entry links to the full
// article (a separate page — the article prose is long-form, not a section).
export default async function GuideArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tnav = await getTranslations("nav");
  const audit = await getTranslations("guideAudit");
  const conformance = await getTranslations("guideConformance");
  const vpat = await getTranslations("guideVpat");
  const esg = await getTranslations("guideEsg");

  const articles = [
    { href: "/guides/accessibility-audit", title: audit("heading"), intro: audit("intro") },
    { href: "/guides/conformance-report", title: conformance("heading"), intro: conformance("intro") },
    { href: "/guides/vpat", title: vpat("heading"), intro: vpat("intro") },
    { href: "/guides/esg-accessibility", title: esg("heading"), intro: esg("intro") },
  ];

  return (
    <PageShell width="3xl">
      <PageHeading>{tnav("guideArticles")}</PageHeading>

      <ul className="mt-8 space-y-4">
        {articles.map((article) => (
          <li key={article.href} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
            <h2 className="m-0 font-display text-base font-semibold text-terminal-fg">
              <Link href={article.href} className="text-terminal-fg underline-offset-4 hover:underline">
                {article.title}
              </Link>
            </h2>
            <p className="mt-1 font-sans text-sm text-terminal-muted">{article.intro}</p>
            <p className="mt-2">
              <Link
                href={article.href}
                className="inline-flex min-h-6 items-center font-sans text-sm text-brandLink underline underline-offset-4 hover:text-brand"
              >
                {tnav("guidesOverview")} →
              </Link>
            </p>
          </li>
        ))}
      </ul>

      <RelatedLinks path="/guide-articles" />
    </PageShell>
  );
}
