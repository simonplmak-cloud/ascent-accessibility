import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guideVpat" });
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

export default async function VpatGuide() {
  const t = await getTranslations("guideVpat");
  const tn = await getTranslations("nav");
  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
  ];

  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <Breadcrumbs trail={[{ href: "/guides", label: tn("guides") }, { label: t("heading") }]} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("shortTitle")}>
        <p>
          {t.rich("shortBody", {
            vpat: (chunks) => <span className="text-terminal-fg">{chunks}</span>,
            acr: (chunks) => <span className="text-terminal-fg">{chunks}</span>,
          })}
        </p>
      </Section>

      <Section title={t("compareTitle")}>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium"></th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thSelf")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thIndep")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">{t("rowWrites")}</th>
                <td className="px-3 py-2">{t("rowWritesSelf")}</td>
                <td className="px-3 py-2">{t("rowWritesIndep")}</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">{t("rowCred")}</th>
                <td className="px-3 py-2">{t("rowCredSelf")}</td>
                <td className="px-3 py-2">{t("rowCredIndep")}</td>
              </tr>
              <tr>
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">{t("rowStands")}</th>
                <td className="px-3 py-2">{t("rowStandsSelf")}</td>
                <td className="px-3 py-2">{t("rowStandsIndep")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("includesTitle")}>
        <ul className="list-disc space-y-2 pl-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <li key={n}>{t(`includes${n}`)}</li>
          ))}
        </ul>
        <p className="mt-3">
          <Link href="/guides/conformance-report" className="text-brandLink underline underline-offset-4 hover:text-brand">
            {t("includesLink")}
          </Link>
          .
        </p>
      </Section>

      <Section title={t("questionsTitle")}>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-display text-base font-semibold text-terminal-fg">{faq.q}</h3>
              <p className="mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("getTitle")}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/human-review">{t("requestReview")}</ButtonLink>
          <ButtonLink href="/assess" variant="outline">
            {t("scanFirst")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
