import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return { title: t("title"), description: t("description") };
}

const QA_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default async function FaqPage() {
  const t = await getTranslations("faqPage");
  const faqs = QA_KEYS.map((n) => ({ q: t(`q${n}`), a: t(`a${n}`) }));

  return (
    <PageShell>
      <FaqJsonLd faqs={faqs} />
      <PageBreadcrumbs path="/faq" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>

      <div className="mt-8 space-y-6">
        {faqs.map((faq) => (
          <section
            key={faq.q}
            className="rounded border border-terminal-border bg-terminal-surface p-4"
          >
            <h2 className="font-display text-base font-semibold text-terminal-fg">{faq.q}</h2>
            <p className="mt-2 font-sans text-sm leading-6 text-terminal-muted">{faq.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-muted">
        {t.rich("somethingElse", {
          link: (chunks) => (
            <Link href="/contact" className="text-brandLink underline underline-offset-4 hover:text-brand">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </PageShell>
  );
}
