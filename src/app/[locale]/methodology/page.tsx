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
  const t = await getTranslations({ locale, namespace: "methodology" });
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

export default async function MethodologyPage() {
  const t = await getTranslations("methodology");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("crawlTitle")}>
        {t.rich("crawlBody", {
          code: (chunks) => <code className="text-terminal-fg">{chunks}</code>,
        })}
      </Section>

      <Section title={t("scanTitle")}>
        <p>{t("scanBody")}</p>
      </Section>

      <Section title={t("scoreTitle")}>
        <p>{t("scoreBody")}</p>
      </Section>

      <Section title={t("limitsTitle")}>
        <p>{t("limitsBody")}</p>
      </Section>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        {t.rich("seeAll", {
          link: (chunks) => (
            <Link href="/standards" className="text-brandLink underline underline-offset-4 hover:text-brand">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </PageShell>
  );
}
