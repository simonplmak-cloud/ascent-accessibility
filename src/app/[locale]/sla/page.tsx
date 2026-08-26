import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { LegalNote } from "@/components/legal/legal-note";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sla" });
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

export default async function SlaPage() {
  const t = await getTranslations("sla");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("availTitle")}>{t("availBody")}</Section>

      <Section title={t("supportTitle")}>
        {t.rich("supportBody", {
          mail: (chunks) => <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>,
        })}
      </Section>

      <Section title={t("maintTitle")}>{t("maintBody")}</Section>

      <Section title={t("askTitle")}>
        {t.rich("askBody", {
          link: (chunks) => (
            <Link href="/terms" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </Section>

      <LegalNote label={t("label")} />
    </PageShell>
  );
}
