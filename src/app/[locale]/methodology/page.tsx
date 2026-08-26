import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { reviewableScs } from "@/lib/standards/sc-reviewers";
import { scTitle } from "@/lib/standards/wcag-sc";

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

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");

  return (
    <PageShell>
      <PageBreadcrumbs path="/methodology" title={t("heading")} />
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

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("whoReviewsTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("whoReviewsBody")}</p>
      <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thCriterion")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thReviewer")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thWhy")}</th>
            </tr>
          </thead>
          <tbody>
            {reviewableScs(locale).map((row) => (
              <tr key={row.sc} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{row.sc} {scTitle(row.sc, locale)}</td>
                <td className="px-3 py-2 text-terminal-muted">{row.profile}</td>
                <td className="px-3 py-2 text-terminal-muted">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Section title={t("validationTitle")}>
        <p>{t("validationBody")}</p>
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
