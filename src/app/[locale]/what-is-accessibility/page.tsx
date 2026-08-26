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
  const t = await getTranslations({ locale, namespace: "primer" });
  return { title: t("title"), description: t("description") };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default async function WhatIsAccessibilityPage() {
  const t = await getTranslations("primer");

  return (
    <PageShell width="3xl">
      <PageBreadcrumbs path="/what-is-accessibility" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("shortTitle")}>
        <p>{t("shortBody1")}</p>
        <p className="mt-3">{t("shortBody2")}</p>
      </Section>

      <Section title={t("whoTitle")}>
        <p>{t("whoBody1")}</p>
        <p className="mt-3">{t("whoBody2")}</p>
      </Section>

      <Section title={t("whyTitle")}>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">{t("whyItem1Title")}</span> {t("whyItem1Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("whyItem2Title")}</span> {t("whyItem2Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("whyItem3Title")}</span> {t("whyItem3Body")}
          </li>
        </ul>
      </Section>

      <Section title={t("pourTitle")}>
        <p>{t("pourIntro")}</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">{t("pour1Title")}</span> {t("pour1Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("pour2Title")}</span> {t("pour2Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("pour3Title")}</span> {t("pour3Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("pour4Title")}</span> {t("pour4Body")}
          </li>
        </ul>
      </Section>

      <Section title={t("toolsTitle")}>
        <p>{t("toolsBody")}</p>
      </Section>

      <Section title={t("standardTitle")}>
        <p>
          {t.rich("standardBody", {
            link1: (chunks) => (
              <Link href="/standards" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
            link2: (chunks) => (
              <Link href="/glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
        </p>
      </Section>

      <Section title={t("startTitle")}>
        <p>{t("startBody")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
          <ButtonLink href="/training" variant="outline">
            {t("courseCta")}
          </ButtonLink>
          <ButtonLink href="/glossary" variant="outline">
            {t("glossaryCta")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
