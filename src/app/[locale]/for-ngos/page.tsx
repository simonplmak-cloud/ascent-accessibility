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
  const t = await getTranslations({ locale, namespace: "forNgos" });
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

export default async function ForNgosPage() {
  const t = await getTranslations("forNgos");

  return (
    <PageShell width="3xl">
      <PageBreadcrumbs path="/for-ngos" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("missionTitle")}>
        <p>{t("missionBody")}</p>
      </Section>

      <Section title={t("freeTitle")}>
        <p>{t("freeBody")}</p>
      </Section>

      <Section title={t("evidenceTitle")}>
        <p>
          {t.rich("evidenceBody", {
            link: (chunks) => (
              <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </Section>

      <Section title={t("getTitle")}>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">{t("getItem1Title")}</span> — {t("getItem1Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("getItem2Title")}</span> — {t("getItem2Body")}
          </li>
          <li>
            <span className="text-terminal-fg">{t("getItem3Title")}</span> — {t("getItem3Body")}
          </li>
        </ul>
      </Section>

      <Section title={t("startTitle")}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
          <ButtonLink href="/training" variant="outline">
            {t("courseCta")}
          </ButtonLink>
          <ButtonLink href="/what-is-accessibility" variant="outline">
            {t("primerCta")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
