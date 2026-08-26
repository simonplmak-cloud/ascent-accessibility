import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "a11yStatement" });
  return { title: t("title"), description: t("description") };
}

export default async function AccessibilityStatementPage() {
  const t = await getTranslations("a11yStatement");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("targetTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("targetBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("limitsTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("limitsBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("reportTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        {t.rich("reportBody", {
          mail: (chunks) => <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>,
        })}
      </p>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <Link href="/contact" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("contactLink")}</Link>
      </p>
    </PageShell>
  );
}
