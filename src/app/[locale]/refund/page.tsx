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
  const t = await getTranslations({ locale, namespace: "refund" });
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

export default async function RefundPage() {
  const t = await getTranslations("refund");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>

      <Section title={t("cancelTitle")}>
        {t.rich("cancelBody", {
          link: (chunks) => (
            <Link href="/account" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </Section>

      <Section title={t("refundsTitle")}>
        <p>{t("refundsBody")}</p>
      </Section>

      <Section title={t("donationsTitle")}>
        <p>{t("donationsBody")}</p>
      </Section>

      <Section title={t("contactTitle")}>
        {t.rich("contactBody", {
          mail: (chunks) => <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>,
        })}
      </Section>

      <LegalNote label={t("label")} />
    </PageShell>
  );
}
