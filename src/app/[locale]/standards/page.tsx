import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { listStandards, wcagReference } from "@/lib/standards/catalog";
import { scsForStandard } from "@/lib/standards/version";
import { standardName } from "@/lib/standards/standards-locales";
import { MACHINE_SCS } from "@/lib/standards/sc-coverage";
import { RelatedLinks } from "@/components/ui/related-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "standards" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/standards" },
  };
}

// Dense summary table: every standard on one screen, each row a visible link to
// its fully-expanded detail page (/standards/[id]).
export default async function StandardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("standards");

  const standards = listStandards().map((s) => {
    const ref = wcagReference(s);
    const scs = scsForStandard(ref.version, ref.level);
    const machine = scs.filter((sc) => MACHINE_SCS.has(sc.num)).length;
    return {
      id: s.id,
      name: standardName(s.id, locale),
      level: ref.level,
      total: scs.length,
      machine,
    };
  });

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/standards" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <div className="mt-8 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thStandard")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thLevel")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thScs")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thMachine")}</th>
              <th scope="col" className="px-3 py-2 font-medium">
                <span className="sr-only">{t("viewAllScs")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s) => (
              <tr key={s.id} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 font-medium text-terminal-fg">{s.name}</td>
                <td className="px-3 py-2 text-terminal-muted">{s.level}</td>
                <td className="px-3 py-2 text-terminal-fg">{s.total}</td>
                <td className="px-3 py-2 text-terminal-fg">{s.machine}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/standards/${s.id}`}
                    className="inline-flex min-h-6 items-center text-terminal-fg underline underline-offset-4 hover:text-brand"
                  >
                    {t("viewAllScs")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-10 font-sans text-sm text-terminal-muted">
        {t.rich("source", {
          wcag: (chunks) => (
            <a
              href="https://www.w3.org/TR/WCAG22/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-terminal-fg"
            >
              {chunks}
            </a>
          ),
          methodology: (chunks) => <InlineLink href="/methodology">{chunks}</InlineLink>,
        })}
      </p>
      <p className="mt-2 font-sans text-xs text-terminal-muted">
        {t("citation")}{" "}
        <a
          href="https://www.w3.org/Translations/WCAG21-zh/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-terminal-fg"
        >
          {t("citationLink")}
        </a>
      </p>
          <RelatedLinks path="/standards" />
    </PageShell>
  );
}
