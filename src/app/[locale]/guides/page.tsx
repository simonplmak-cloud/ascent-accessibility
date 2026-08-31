import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { RelatedLinks } from "@/components/ui/related-links";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { reviewableScs } from "@/lib/standards/sc-reviewers";
import { scTitle } from "@/lib/standards/wcag-sc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guidesIndex" });
  return { title: t("title"), description: t("description") };
}

const COMPLIANCE_ROWS: Array<[string, string, string]> = [
  ["EN 301 549 (Europe)", "European harmonised accessibility standard for ICT", "References WCAG 2.1 AA (Table A.1)"],
  ["European Accessibility Act (2019/882)", "EU directive for products and services; applies from 28 June 2025", "Technical basis is EN 301 549 (→ WCAG 2.1 AA)"],
  ["Section 508 (United States)", "US federal procurement accessibility standard (2017 refresh)", "References WCAG 2.0 AA"],
  ["ADA — DOJ web rule (United States)", "US Department of Justice rule for state/local government web content", "References WCAG 2.1 AA"],
  ["AODA (Ontario, Canada)", "Accessibility for Ontarians with Disabilities Act", "References WCAG 2.0 AA"],
  ["BITV 2.0 (Germany)", "German Barrier-free Information Technology Ordinance", "References EN 301 549 (→ WCAG 2.1)"],
  ["UK PSBAR 2018 (United Kingdom)", "Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations", "References WCAG 2.1 AA"],
];

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h3 className="mt-6 font-display text-base font-semibold text-terminal-fg">{title}</h3>
      <div className="mt-2 font-sans leading-7 text-terminal-muted">{children}</div>
    </>
  );
}

// Consolidated "Guides & how-to" hub: methodology, compliance, and FAQ as visible
// anchor sections, with links to the in-depth guide articles and the remediation
// reference (kept standalone — a per-SC index like /standards).
export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const guides = await getTranslations("guidesIndex");
  const methodology = await getTranslations("methodology");
  const compliance = await getTranslations("compliance");
  const faq = await getTranslations("faqPage");
  const tnav = await getTranslations("nav");
  const tcommon = await getTranslations("common");

  const faqs = FAQ_KEYS.map((n) => ({ q: faq(`q${n}`), a: faq(`a${n}`) }));

  const toc = [
    { id: "methodology", label: methodology("heading") },
    { id: "compliance", label: compliance("heading") },
    { id: "faq", label: faq("heading") },
  ];

  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <PageBreadcrumbs path="/guides" title={guides("heading")} />
      <PageHeading>{guides("heading")}</PageHeading>

      <nav aria-label={tcommon("tocLabel")} className="mt-6">
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand">
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/guide-articles" className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand">
              {tnav("guideArticles")}
            </Link>
          </li>
          <li>
            <Link href="/remediation" className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand">
              {tnav("remediation")}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Methodology */}
      <section id="methodology" aria-labelledby="methodology-heading" className="mt-10 scroll-mt-24">
        <h2 id="methodology-heading" className="font-display text-xl font-semibold text-terminal-fg">
          {methodology("heading")}
        </h2>
        <MutedText className="mt-2">{methodology("intro")}</MutedText>
        <Sub title={methodology("crawlTitle")}>
          {methodology.rich("crawlBody", {
            code: (chunks) => <code className="text-terminal-fg">{chunks}</code>,
          })}
        </Sub>
        <Sub title={methodology("scanTitle")}>{methodology("scanBody")}</Sub>
        <Sub title={methodology("scoreTitle")}>{methodology("scoreBody")}</Sub>
        <Sub title={methodology("limitsTitle")}>{methodology("limitsBody")}</Sub>
        <Sub title={methodology("whoReviewsTitle")}>{methodology("whoReviewsBody")}</Sub>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">{methodology("thCriterion")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{methodology("thReviewer")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{methodology("thWhy")}</th>
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
        <Sub title={methodology("validationTitle")}>{methodology("validationBody")}</Sub>
      </section>

      {/* Compliance */}
      <section id="compliance" aria-labelledby="compliance-heading" className="mt-10 scroll-mt-24">
        <h2 id="compliance-heading" className="font-display text-xl font-semibold text-terminal-fg">
          {compliance("heading")}
        </h2>
        <MutedText className="mt-2">{compliance("intro")}</MutedText>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">{compliance("thReg")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{compliance("thScope")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{compliance("thRef")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_ROWS.map(([name, scope, ref]) => (
                <tr key={name} className="border-b border-terminal-border last:border-b-0">
                  <td className="px-3 py-2 text-terminal-fg">{name}</td>
                  <td className="px-3 py-2 text-terminal-muted">{scope}</td>
                  <td className="px-3 py-2 text-terminal-muted">{ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="mt-10 scroll-mt-24">
        <h2 id="faq-heading" className="font-display text-xl font-semibold text-terminal-fg">
          {faq("heading")}
        </h2>
        <div className="mt-4 space-y-4">
          {faqs.map((item) => (
            <section key={item.q} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
              <h3 className="m-0 font-display text-base font-semibold text-terminal-fg">{item.q}</h3>
              <p className="mt-2 font-sans text-sm leading-6 text-terminal-muted">{item.a}</p>
            </section>
          ))}
        </div>
        <p className="mt-6 font-sans text-sm text-terminal-muted">
          {faq.rich("somethingElse", {
            link: (chunks) => (
              <Link href="/contact" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
        </p>
      </section>

      <RelatedLinks path="/guides" />
    </PageShell>
  );
}
