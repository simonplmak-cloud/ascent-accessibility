import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { WCAG_SCS, principleName, scTitle } from "@/lib/standards/wcag-sc";
import { getScRemediation } from "@/lib/standards/sc-remediation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "remediation" });
  return { title: t("title"), description: t("description") };
}

const principles = [1, 2, 3, 4] as const;

export default async function RemediationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("remediation");

  return (
    <PageShell width="4xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      {principles.map((principle) => (
        <section key={principle} aria-labelledby={`p-${principle}`} className="mt-10">
          <h2 id={`p-${principle}`} className="font-display text-xl font-semibold text-terminal-fg">
            {principle}. {principleName(principle, locale)}
          </h2>
          <ul className="mt-3 space-y-3">
            {WCAG_SCS.filter((sc) => sc.principle === principle).map((sc) => (
              <li key={sc.num} className="rounded border border-terminal-border p-3">
                <p className="font-sans text-sm text-terminal-fg">
                  <span className="font-semibold">{sc.num} {scTitle(sc.num, locale)}</span>{" "}
                  <span className="text-terminal-muted">{t("levelLabel", { level: sc.level })}</span>
                </p>
                <p className="mt-1 font-sans text-sm text-terminal-muted">
                  {getScRemediation(sc.num)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
