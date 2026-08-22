import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forGovernment" });
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

export default async function ForGovernmentPage() {
  const t = await getTranslations("forGovernment");

  return (
    <PageShell width="3xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("requirementTitle")}>
        <p>{t("requirementBody")}</p>
      </Section>

      <Section title={t("selfDeclaredTitle")}>
        <p>{t("selfDeclaredBody")}</p>
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
          <li>
            <span className="text-terminal-fg">{t("getItem4Title")}</span> — {t("getItem4Body")}
          </li>
        </ul>
      </Section>

      <Section title={t("trustTitle")}>
        <p>
          {t.rich("trustBody", {
            methodology: (chunks) => (
              <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">
                {chunks}
              </Link>
            ),
            validation: (chunks) => (
              <Link href="/validation" className="text-brandLink underline underline-offset-4 hover:text-brand">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </Section>

      <Section title={t("startTitle")}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
          <ButtonLink href="/human-review" variant="outline">
            {t("humanReviewCta")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
