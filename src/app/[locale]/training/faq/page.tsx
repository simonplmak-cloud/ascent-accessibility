import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { courseFaqFor } from "@/lib/training/faq";
import { curriculumFor } from "@/lib/training/curriculum";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "training" });
  return {
    title: t("faqHeading"),
    description: t("description"),
    alternates: { canonical: "/training/faq" },
  };
}

export default async function TrainingFaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("training");
  const { path } = curriculumFor(locale);
  const faq = courseFaqFor(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <PageBreadcrumbs path="/training/faq" title={t("faqHeading")} />

      <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("faqHeading")}</h1>
      <p className="mt-2 font-sans text-sm text-terminal-muted">
        {t("faqAbout", { path: path.title })}{" "}
        <Link href="/faq" className="underline underline-offset-4 hover:text-terminal-fg">
          {t("mainFaq")}
        </Link>
        .
      </p>

      <div className="mt-8 space-y-4">
        {faq.map((entry) => (
          <section key={entry.q} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
            <h2 className="font-sans text-sm font-semibold text-terminal-fg">{entry.q}</h2>
            <p className="mt-1 font-sans text-sm text-terminal-muted">{entry.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-8">
        <Link
          href={`/training/paths/${path.id}`}
          className="inline-block rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          {t("backToCourse")}
        </Link>
      </p>
    </div>
  );
}
