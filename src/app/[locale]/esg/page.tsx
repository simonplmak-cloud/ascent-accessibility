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
  const t = await getTranslations({ locale, namespace: "esg" });
  return { title: t("title"), description: t("description") };
}

const rows: Array<[string, string]> = [
  ["GRI 405 (Diversity & Equal Opportunity)", "Evidence of inclusion of people with disabilities in products and services."],
  ["GRI 406 (Non-discrimination)", "Accessibility barriers are discrimination risks; the report is mitigation evidence."],
  ["GRI 1 (Foundation)", "Reporting itself should be accessible — our report targets WCAG 2.2 AAA."],
  ["ESRS S1 (Own Workforce)", "S1-12 disability disclosure; our lived-experience review workforce (launching soon) will evidence inclusion."],
  ["ESRS S4 (Consumers & End-users)", "Digital accessibility of products and services where material — accessible services are an explicit example."],
  ["IFRS S1 / S2 (ISSB)", "Sustainability-related risk and opportunity disclosure (S2 is climate-only; no accessibility metric)."],
  ["SASB Standards", "Industry-specific metrics; check the applicable sector for customer/accessibility items."],
  ["ILO &lsquo;Putting the I in ESG&rsquo;", "Disability-inclusion indicators for investors."],
  ["Disability:IN — Disability Equality Index", "Digital accessibility is a scored category; the conformance report is the artifact."],
  ["UN SDG 10 / 8 / 9.c", "Reduced inequalities, decent work, and ICT access."],
  ["VPAT / ACR", "The procurement conformance template, exported as a draft from the same per-criterion data (full verified ACR follows human review)."],
  ["EAA / EN 301 549 / Section 508 / AODA / BITV", "Substantive legal and technical obligations for which WCAG is the technical basis."],
];

export default async function EsgPage() {
  const t = await getTranslations("esg");

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/esg" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">
        {t.rich("intro", {
          strong: (chunks) => <strong className="text-terminal-fg">{chunks}</strong>,
        })}
      </MutedText>

      <div className="mt-8 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thFramework")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thWhere")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([framework, use]) => (
              <tr key={framework} className="border-b border-terminal-border last:border-b-0">
                <td className="px-3 py-2 text-terminal-fg">{framework}</td>
                <td className="px-3 py-2 text-terminal-muted">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-muted">
        {t.rich("footer", {
          link1: (chunks) => (
            <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          link2: (chunks) => (
            <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </p>
    </PageShell>
  );
}
