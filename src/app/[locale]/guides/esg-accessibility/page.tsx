import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guideEsg" });
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

export default async function EsgAccessibilityGuide() {
  const t = await getTranslations("guideEsg");
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
      <PageBreadcrumbs path="/guides/esg-accessibility" title={t("heading")} />

      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("sTitle")}>
        <p>
          {t.rich("sBody", {
            social: (chunks) => <span className="text-terminal-fg">{chunks}</span>,
          })}
        </p>
      </Section>

      <Section title={t("mapsTitle")}>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">{t("thFramework")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thWhere")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">{t("rowGri")}</td>
                <td className="px-3 py-2">{t("rowGriWhere")}</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">{t("rowEsrs")}</td>
                <td className="px-3 py-2">{t("rowEsrsWhere")}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-terminal-fg">{t("rowSasb")}</td>
                <td className="px-3 py-2">{t("rowSasbWhere")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">
            {t("mapsLink")}
          </Link>
          .
        </p>
      </Section>

      <Section title={t("evidenceTitle")}>
        <p>
          {t.rich("evidenceBody", {
            link: (chunks) => (
              <Link href="/guides/conformance-report" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
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
          <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
          <ButtonLink href="/esg" variant="outline">
            {t("esgCta")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
