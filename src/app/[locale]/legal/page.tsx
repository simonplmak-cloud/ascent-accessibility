import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { RelatedLinks } from "@/components/ui/related-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("title") };
}

const MAIL = "contact@ascent-partners.com";

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
      <p className="mt-2 font-sans leading-7 text-terminal-muted">{children}</p>
    </>
  );
}

// Consolidated legal hub: terms, privacy, SLA, refunds, and the accessibility
// statement as visible anchor sections on one page (no hidden sub-pages).
export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const terms = await getTranslations("terms");
  const privacy = await getTranslations("privacy");
  const sla = await getTranslations("sla");
  const refund = await getTranslations("refund");
  const a11y = await getTranslations("a11yStatement");

  const toc = [
    { id: "terms", label: t("termsTitle") },
    { id: "privacy", label: t("privacyTitle") },
    { id: "sla", label: t("slaTitle") },
    { id: "refund", label: t("refundTitle") },
    { id: "accessibility-statement", label: t("a11yTitle") },
  ];

  return (
    <PageShell width="3xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <nav aria-label={t("tocLabel")} className="mt-6">
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Terms */}
      <Section id="terms" title={terms("heading")}>
        <p className="text-sm text-terminal-muted">{terms("lastUpdated")}</p>
        <Sub title={terms("s1Title")}>{terms("s1Body")}</Sub>
        <Sub title={terms("s2Title")}>
          {terms.rich("s2Body", {
            strong: (chunks) => <strong className="text-terminal-fg">{chunks}</strong>,
          })}
        </Sub>
        <Sub title={terms("s3Title")}>{terms("s3Body")}</Sub>
        <Sub title={terms("s4Title")}>{terms("s4Body")}</Sub>
        <Sub title={terms("s5Title")}>{terms("s5Body")}</Sub>
        <Sub title={terms("s6Title")}>{terms("s6Body")}</Sub>
        <Sub title={terms("s7Title")}>{terms("s7Body")}</Sub>
        <Sub title={terms("s8Title")}>
          {terms.rich("s8Body", {
            mail: (chunks) => (
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>
            ),
            link: (chunks) => (
              <a href="#privacy" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</a>
            ),
          })}
        </Sub>
      </Section>

      {/* Privacy */}
      <Section id="privacy" title={privacy("heading")}>
        <p className="text-sm text-terminal-muted">{privacy("lastUpdated")}</p>
        <h3 className="mt-6 font-display text-base font-semibold text-terminal-fg">{privacy("c1Title")}</h3>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          {([
            ["c1a", "c1aBody"],
            ["c1b", "c1bBody"],
            ["c1c", "c1cBody"],
            ["c1d", "c1dBody"],
          ] as Array<[string, string]>).map(([label, body]) => (
            <li key={label}>
              <strong className="text-terminal-fg">{privacy(label)}</strong> — {privacy(body)}
            </li>
          ))}
        </ul>
        <Sub title={privacy("c2Title")}>{privacy("c2Body")}</Sub>
        <Sub title={privacy("c3Title")}>{privacy("c3Body")}</Sub>
        <Sub title={privacy("c4Title")}>{privacy("c4Body")}</Sub>
        <Sub title={privacy("c5Title")}>
          {privacy.rich("c5Body", {
            mail: (chunks) => (
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>
            ),
          })}
        </Sub>
      </Section>

      {/* SLA */}
      <Section id="sla" title={sla("heading")}>
        <Sub title={sla("availTitle")}>{sla("availBody")}</Sub>
        <Sub title={sla("supportTitle")}>
          {sla.rich("supportBody", {
            mail: (chunks) => (
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>
            ),
          })}
        </Sub>
        <Sub title={sla("maintTitle")}>{sla("maintBody")}</Sub>
        <Sub title={sla("askTitle")}>
          {sla.rich("askBody", {
            link: (chunks) => (
              <a href="#terms" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</a>
            ),
          })}
        </Sub>
      </Section>

      {/* Refund */}
      <Section id="refund" title={refund("heading")}>
        <Sub title={refund("cancelTitle")}>
          {refund.rich("cancelBody", {
            link: (chunks) => (
              <Link href="/account" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
          })}
        </Sub>
        <Sub title={refund("refundsTitle")}>{refund("refundsBody")}</Sub>
        <Sub title={refund("donationsTitle")}>{refund("donationsBody")}</Sub>
        <Sub title={refund("contactTitle")}>
          {refund.rich("contactBody", {
            mail: (chunks) => (
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>
            ),
          })}
        </Sub>
      </Section>

      {/* Accessibility statement */}
      <Section id="accessibility-statement" title={a11y("heading")}>
        <Sub title={a11y("targetTitle")}>{a11y("targetBody")}</Sub>
        <Sub title={a11y("limitsTitle")}>{a11y("limitsBody")}</Sub>
        <Sub title={a11y("reportTitle")}>
          {a11y.rich("reportBody", {
            mail: (chunks) => (
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>
            ),
          })}
        </Sub>
        <p className="mt-6">
          <Link href="/contact" className="text-brandLink underline underline-offset-4 hover:text-brand">
            {a11y("contactLink")}
          </Link>
        </p>
      </Section>

      <RelatedLinks path="/legal" />
    </PageShell>
  );
}
