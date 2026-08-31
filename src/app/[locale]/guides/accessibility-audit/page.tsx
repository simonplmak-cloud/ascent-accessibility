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
  const t = await getTranslations({ locale, namespace: "guideAudit" });
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

export default async function AccessibilityAuditGuide() {
  const t = await getTranslations("guideAudit");
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
      <PageBreadcrumbs path="/guides/accessibility-audit" title={t("heading")} />

      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("shortTitle")}>
        <p>{t("shortBody")}</p>
      </Section>

      <Section title={t("methodsTitle")}>
        <p>{t("methodsIntro")}</p>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">{t("thMethod")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thWhat")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thCatches")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t("thLimit")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">{t("automated")}</td>
                <td className="px-3 py-2">{t("automatedWhat")}</td>
                <td className="px-3 py-2">{t("automatedCatches")}</td>
                <td className="px-3 py-2">{t("automatedLimit")}</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">{t("ai")}</td>
                <td className="px-3 py-2">{t("aiWhat")}</td>
                <td className="px-3 py-2">{t("aiCatches")}</td>
                <td className="px-3 py-2">{t("aiLimit")}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-terminal-fg">{t("manual")}</td>
                <td className="px-3 py-2">{t("manualWhat")}</td>
                <td className="px-3 py-2">{t("manualCatches")}</td>
                <td className="px-3 py-2">{t("manualLimit")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("coversTitle")}>
        <p>{t("coversBody")}</p>
      </Section>

      <Section title={t("readResultTitle")}>
        <p>
          {t.rich("readResultBody", {
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

      <Section title={t("runTitle")}>
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
