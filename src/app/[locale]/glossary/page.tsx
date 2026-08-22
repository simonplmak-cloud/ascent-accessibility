import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";
import { GLOSSARY_TERMS } from "@/lib/glossary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  return { title: t("heading"), description: t("description") };
}

export default async function GlossaryPage() {
  const t = await getTranslations("glossary");

  return (
    <PageShell width="4xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">
        {t.rich("intro", {
          link: (chunks) => (
            <Link href="/what-is-accessibility" className="text-brandLink underline underline-offset-4 hover:text-brand">
              {chunks}
            </Link>
          ),
        })}
      </MutedText>

      <dl className="mt-8 space-y-4">
        {GLOSSARY_TERMS.map((entry) => (
          <div
            key={entry.id}
            className="rounded border border-terminal-border bg-terminal-surface/40 p-4"
          >
            <dt className="font-display text-base font-semibold text-terminal-fg">
              {t(`${entry.id}.term`)}
            </dt>
            <dd className="mt-1 font-sans text-sm text-terminal-muted">{t(`${entry.id}.definition`)}</dd>
            <dd className="mt-1 font-sans text-sm text-terminal-fg">
              <span className="text-terminal-muted">{t("whyLabel")}</span>
              {t(`${entry.id}.why`)}
            </dd>
            {entry.href && (
              <dd className="mt-2 font-sans text-sm">
                <Link
                  href={entry.href}
                  className="text-brandLink underline underline-offset-4 hover:text-brand"
                >
                  {t(`${entry.id}.hrefLabel`)} →
                </Link>
              </dd>
            )}
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ButtonLink href="/what-is-accessibility" variant="outline">
          {t("readIntro")}
        </ButtonLink>
        <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
      </div>
    </PageShell>
  );
}
