import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";
import { RelatedLinks } from "@/components/ui/related-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("whoWeServe") };
}

const ESG_ROWS: Array<[string, string]> = [
  ["GRI 405 (Diversity & Equal Opportunity)", "Evidence of inclusion of people with disabilities in products and services."],
  ["GRI 406 (Non-discrimination)", "Accessibility barriers are discrimination risks; the report is mitigation evidence."],
  ["GRI 1 (Foundation)", "Reporting itself should be accessible — our report targets WCAG 2.2 AAA."],
  ["ESRS S1 (Own Workforce)", "S1-12 disability disclosure; our lived-experience review workforce (launching soon) will evidence inclusion."],
  ["ESRS S4 (Consumers & End-users)", "Digital accessibility of products and services where material — accessible services are an explicit example."],
  ["IFRS S1 / S2 (ISSB)", "Sustainability-related risk and opportunity disclosure (S2 is climate-only; no accessibility metric)."],
  ["SASB Standards", "Industry-specific metrics; check the applicable sector for customer/accessibility items."],
  ["ILO 'Putting the I in ESG'", "Disability-inclusion indicators for investors."],
  ["Disability:IN — Disability Equality Index", "Digital accessibility is a scored category; the conformance report is the artifact."],
  ["UN SDG 10 / 8 / 9.c", "Reduced inequalities, decent work, and ICT access."],
  ["VPAT / ACR", "The procurement conformance template, exported as a draft from the same per-criterion data (full verified ACR follows human review)."],
  ["EAA / EN 301 549 / Section 508 / AODA / BITV", "Substantive legal and technical obligations for which WCAG is the technical basis."],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-10 scroll-mt-24">
      <h2 id={`${id}-heading`} className="font-display text-xl font-semibold text-terminal-fg">
        {title}
      </h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h3 className="mt-6 font-display text-base font-semibold text-terminal-fg">{title}</h3>
      <div className="mt-2 font-sans leading-7 text-terminal-muted">{children}</div>
    </>
  );
}

// Consolidated "Who we serve" hub: government, NGOs, and ESG mapping as visible
// anchor sections on one page.
export default async function WhoWeServePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tnav = await getTranslations("nav");
  const tcommon = await getTranslations("common");
  const gov = await getTranslations("forGovernment");
  const ngo = await getTranslations("forNgos");
  const esg = await getTranslations("esg");

  const toc = [
    { id: "government", label: gov("heading") },
    { id: "ngos", label: ngo("heading") },
    { id: "esg", label: esg("heading") },
  ];

  return (
    <PageShell width="3xl">
      <PageHeading>{tnav("whoWeServe")}</PageHeading>

      <nav aria-label={tcommon("tocLabel")} className="mt-6">
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Government */}
      <Section id="government" title={gov("heading")}>
        <MutedText>{gov("intro")}</MutedText>
        <Sub title={gov("requirementTitle")}>{gov("requirementBody")}</Sub>
        <Sub title={gov("selfDeclaredTitle")}>{gov("selfDeclaredBody")}</Sub>
        <Sub title={gov("getTitle")}>
          <ul className="list-disc space-y-2 pl-6">
            {(["getItem1", "getItem2", "getItem3", "getItem4"] as const).map((key) => (
              <li key={key}>
                <span className="text-terminal-fg">{gov(`${key}Title`)}</span> — {gov(`${key}Body`)}
              </li>
            ))}
          </ul>
        </Sub>
        <Sub title={gov("trustTitle")}>
          {gov.rich("trustBody", {
            methodology: (chunks) => (
              <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
            validation: (chunks) => (
              <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
        </Sub>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/assess">{gov("scanFree")}</ButtonLink>
          <ButtonLink href="/human-review" variant="outline">{gov("humanReviewCta")}</ButtonLink>
        </div>
      </Section>

      {/* NGOs */}
      <Section id="ngos" title={ngo("heading")}>
        <MutedText>{ngo("intro")}</MutedText>
        <Sub title={ngo("missionTitle")}>{ngo("missionBody")}</Sub>
        <Sub title={ngo("freeTitle")}>{ngo("freeBody")}</Sub>
        <Sub title={ngo("evidenceTitle")}>
          {ngo.rich("evidenceBody", {
            link: (chunks) => (
              <a href="#esg" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</a>
            ),
          })}
        </Sub>
        <Sub title={ngo("getTitle")}>
          <ul className="list-disc space-y-2 pl-6">
            {(["getItem1", "getItem2", "getItem3"] as const).map((key) => (
              <li key={key}>
                <span className="text-terminal-fg">{ngo(`${key}Title`)}</span> — {ngo(`${key}Body`)}
              </li>
            ))}
          </ul>
        </Sub>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/assess">{ngo("scanFree")}</ButtonLink>
          <ButtonLink href="/training" variant="outline">{ngo("courseCta")}</ButtonLink>
        </div>
      </Section>

      {/* ESG */}
      <Section id="esg" title={esg("heading")}>
        <MutedText>
          {esg.rich("intro", {
            strong: (chunks) => <strong className="text-terminal-fg">{chunks}</strong>,
          })}
        </MutedText>
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">{esg("thFramework")}</th>
                <th scope="col" className="px-3 py-2 font-medium">{esg("thWhere")}</th>
              </tr>
            </thead>
            <tbody>
              {ESG_ROWS.map(([framework, use]) => (
                <tr key={framework} className="border-b border-terminal-border last:border-b-0">
                  <td className="px-3 py-2 text-terminal-fg">{framework}</td>
                  <td className="px-3 py-2 text-terminal-muted">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6">
          {esg.rich("footer", {
            link1: (chunks) => (
              <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
            link2: (chunks) => (
              <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
        </p>
      </Section>

      <RelatedLinks path="/who-we-serve" />
    </PageShell>
  );
}
