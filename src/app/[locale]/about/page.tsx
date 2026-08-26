import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { InlineLink } from "@/components/ui/inline-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <PageShell>
      <PageBreadcrumbs path="/about" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>

      <p className="mt-6 font-sans leading-7 text-terminal-fg">{t("intro")}</p>
      <p className="mt-4 font-sans text-sm text-terminal-muted">{t("charityNote")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("focusTitle")}</h2>
      <ul className="mt-4 space-y-3 font-sans leading-7 text-terminal-muted">
        <li>
          <span className="text-terminal-fg">{t("focus1Title")}</span> — {t("focus1Body")}
        </li>
        <li>
          <span className="text-terminal-fg">{t("focus2Title")}</span> — {t("focus2Body")}
        </li>
        <li>
          <span className="text-terminal-fg">{t("focus3Title")}</span> — {t("focus3Body")}
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("toolsTitle")}</h2>
      <p className="mt-4 font-sans leading-7 text-terminal-muted">{t("toolsBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("peopleTitle")}</h2>
      <p className="mt-4 font-sans leading-7 text-terminal-muted">{t("peopleBody")}</p>
      <p className="mt-4 font-sans text-sm text-terminal-fg">
        <InlineLink href="/contact">{t("getInTouch")}</InlineLink>
      </p>
    </PageShell>
  );
}
