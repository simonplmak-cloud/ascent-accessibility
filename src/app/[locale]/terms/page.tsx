import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { LegalNote } from "@/components/legal/legal-note";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("title"), description: t("description") };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{children}</p>
    </>
  );
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>
      <p className="mt-3 font-sans text-sm text-terminal-muted">{t("lastUpdated")}</p>

      <Section title={t("s1Title")}>{t("s1Body")}</Section>

      <Section title={t("s2Title")}>
        {t.rich("s2Body", {
          strong: (chunks) => <strong className="text-terminal-fg">{chunks}</strong>,
        })}
      </Section>

      <Section title={t("s3Title")}>{t("s3Body")}</Section>
      <Section title={t("s4Title")}>{t("s4Body")}</Section>
      <Section title={t("s5Title")}>{t("s5Body")}</Section>
      <Section title={t("s6Title")}>{t("s6Body")}</Section>
      <Section title={t("s7Title")}>{t("s7Body")}</Section>

      <Section title={t("s8Title")}>
        {t.rich("s8Body", {
          mail: (chunks) => <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>,
          link: (chunks) => (
            <Link href="/privacy" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </Section>

      <LegalNote label={t("label")} />
    </PageShell>
  );
}
