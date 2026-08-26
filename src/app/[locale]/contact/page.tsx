import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <PageShell>
      <PageBreadcrumbs path="/contact" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>
      <address className="mt-6 not-italic font-sans text-terminal-fg">
        <p>
          {t("email")}{" "}
          <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4">
            contact@ascent-partners.com
          </a>
        </p>
        <p className="mt-2">
          {t("website")}{" "}
          <a
            href="https://www.ascent.partners"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.ascent.partners<span className="sr-only"> (opens in a new window)</span>
          </a>
        </p>
      </address>
    </PageShell>
  );
}
