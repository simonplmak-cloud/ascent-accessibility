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
  const t = await getTranslations({ locale, namespace: "guideConformance" });
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

export default async function ConformanceReportGuide() {
  const t = await getTranslations("guideConformance");
  const tn = await getTranslations("nav");
  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
  ];
  const items = [1, 2, 3, 4, 5];

  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <Breadcrumbs trail={[{ href: "/guides", label: tn("guides") }, { label: t("heading") }]} />
      <PageBreadcrumbs path="/guides/conformance-report" title={t("heading")} />

      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <Section title={t("shortTitle")}>
        <p>{t("shortBody")}</p>
      </Section>

      <Section title={t("containsTitle")}>
        <ul className="list-disc space-y-2 pl-6">
          {items.map((n) => (
            <li key={n}>
              <span className="text-terminal-fg">{t(`item${n}Title`)}</span> — {t(`item${n}Body`)}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("passesTitle")}>
        <p>
          {t.rich("passesBody", {
            link: (chunks) => (
              <Link href="/guides/accessibility-audit" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
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
          <ButtonLink href="/human-review" variant="outline">
            {t("reviewCta")}
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
