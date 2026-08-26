import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compliance" });
  return { title: t("title"), description: t("description") };
}

const rows: Array<[string, string, string]> = [
  ["EN 301 549 (Europe)", "European harmonised accessibility standard for ICT", "References WCAG 2.1 AA (Table A.1)"],
  ["European Accessibility Act (2019/882)", "EU directive for products and services; applies from 28 June 2025", "Technical basis is EN 301 549 (→ WCAG 2.1 AA)"],
  ["Section 508 (United States)", "US federal procurement accessibility standard (2017 refresh)", "References WCAG 2.0 AA"],
  ["ADA — DOJ web rule (United States)", "US Department of Justice rule for state/local government web content", "References WCAG 2.1 AA"],
  ["AODA (Ontario, Canada)", "Accessibility for Ontarians with Disabilities Act", "References WCAG 2.0 AA"],
  ["BITV 2.0 (Germany)", "German Barrier-free Information Technology Ordinance", "References EN 301 549 (→ WCAG 2.1)"],
  ["UK PSBAR 2018 (United Kingdom)", "Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations", "References WCAG 2.1 AA"],
];

export default async function CompliancePage() {
  const t = await getTranslations("compliance");

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/compliance" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <div className="mt-8 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thReg")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thScope")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thRef")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, scope, ref]) => (
              <tr key={name} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{name}</td>
                <td className="px-3 py-2 text-terminal-muted">{scope}</td>
                <td className="px-3 py-2 text-terminal-muted">{ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("esgLink")}</Link>{" · "}
        <Link href="/human-review" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("humanReview")}</Link>
      </p>
    </PageShell>
  );
}
