import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guidesIndex" });
  return { title: t("title"), description: t("description") };
}

const guideKeys = [
  { href: "/guides/accessibility-audit", titleKey: "guide1Title", bodyKey: "guide1Body" },
  { href: "/guides/conformance-report", titleKey: "guide2Title", bodyKey: "guide2Body" },
  { href: "/guides/vpat", titleKey: "guide3Title", bodyKey: "guide3Body" },
  { href: "/guides/esg-accessibility", titleKey: "guide4Title", bodyKey: "guide4Body" },
];

export default async function GuidesPage() {
  const t = await getTranslations("guidesIndex");

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/guides" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">
        {t.rich("intro", {
          link1: (chunks) => (
            <Link href="/what-is-accessibility" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          link2: (chunks) => (
            <Link href="/glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </MutedText>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {guideKeys.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="rounded border border-terminal-border bg-terminal-surface/40 p-5 hover:border-terminal-serious"
          >
            <h2 className="font-display text-lg font-semibold text-terminal-fg">{t(guide.titleKey)}</h2>
            <p className="mt-2 font-sans text-sm text-terminal-muted">{t(guide.bodyKey)}</p>
            <p className="mt-3 font-sans text-xs text-brandLink">{t("readGuide")}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
        <ButtonLink href="/training" variant="outline">
          {t("courseCta")}
        </ButtonLink>
      </div>
    </PageShell>
  );
}
