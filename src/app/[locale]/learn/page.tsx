import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";
import { RelatedLinks } from "@/components/ui/related-links";
import { GLOSSARY_TERMS } from "@/lib/site/glossary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("learnBasics") };
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h3 className="mt-6 font-display text-base font-semibold text-terminal-fg">{title}</h3>
      <div className="mt-2 font-sans leading-7 text-terminal-muted">{children}</div>
    </>
  );
}

// Consolidated "Learn the basics" hub: the accessibility primer + the glossary as
// visible anchor sections on one page.
export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tnav = await getTranslations("nav");
  const tcommon = await getTranslations("common");
  const primer = await getTranslations("primer");
  const glossary = await getTranslations("glossary");

  const toc = [
    { id: "what-is-accessibility", label: primer("heading") },
    { id: "glossary", label: glossary("heading") },
  ];

  return (
    <PageShell width="3xl">
      <PageHeading>{tnav("learnBasics")}</PageHeading>

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

      {/* Primer */}
      <section id="what-is-accessibility" aria-labelledby="what-is-accessibility-heading" className="mt-10 scroll-mt-24">
        <h2 id="what-is-accessibility-heading" className="font-display text-xl font-semibold text-terminal-fg">
          {primer("heading")}
        </h2>
        <MutedText className="mt-2">{primer("intro")}</MutedText>
        <Sub title={primer("shortTitle")}>
          <p>{primer("shortBody1")}</p>
          <p className="mt-3">{primer("shortBody2")}</p>
        </Sub>
        <Sub title={primer("whoTitle")}>
          <p>{primer("whoBody1")}</p>
          <p className="mt-3">{primer("whoBody2")}</p>
        </Sub>
        <Sub title={primer("whyTitle")}>
          <ul className="list-disc space-y-2 pl-6">
            {(["whyItem1", "whyItem2", "whyItem3"] as const).map((key) => (
              <li key={key}>
                <span className="text-terminal-fg">{primer(`${key}Title`)}</span> {primer(`${key}Body`)}
              </li>
            ))}
          </ul>
        </Sub>
        <Sub title={primer("pourTitle")}>
          <p>{primer("pourIntro")}</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {(["pour1", "pour2", "pour3", "pour4"] as const).map((key) => (
              <li key={key}>
                <span className="text-terminal-fg">{primer(`${key}Title`)}</span> {primer(`${key}Body`)}
              </li>
            ))}
          </ul>
        </Sub>
        <Sub title={primer("toolsTitle")}>{primer("toolsBody")}</Sub>
        <Sub title={primer("standardTitle")}>
          {primer.rich("standardBody", {
            link1: (chunks) => (
              <Link href="/standards" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
            ),
            link2: (chunks) => (
              <a href="#glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</a>
            ),
          })}
        </Sub>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/assess">{primer("scanFree")}</ButtonLink>
          <ButtonLink href="/training" variant="outline">{primer("courseCta")}</ButtonLink>
        </div>
      </section>

      {/* Glossary */}
      <section id="glossary" aria-labelledby="glossary-heading" className="mt-10 scroll-mt-24">
        <h2 id="glossary-heading" className="font-display text-xl font-semibold text-terminal-fg">
          {glossary("heading")}
        </h2>
        <MutedText className="mt-2">
          {glossary.rich("intro", {
            link: (chunks) => (
              <a href="#what-is-accessibility" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</a>
            ),
          })}
        </MutedText>
        <dl className="mt-6 space-y-4">
          {GLOSSARY_TERMS.map((entry) => (
            <div key={entry.id} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
              <dt className="font-display text-base font-semibold text-terminal-fg">
                {glossary(`${entry.id}.term`)}
              </dt>
              <dd className="mt-1 font-sans text-sm text-terminal-muted">{glossary(`${entry.id}.definition`)}</dd>
              <dd className="mt-1 font-sans text-sm text-terminal-fg">
                <span className="text-terminal-muted">{glossary("whyLabel")}</span>
                {glossary(`${entry.id}.why`)}
              </dd>
              {entry.href && (
                <dd className="mt-2 font-sans text-sm">
                  <Link href={entry.href} className="text-brandLink underline underline-offset-4 hover:text-brand">
                    {glossary(`${entry.id}.hrefLabel`)} →
                  </Link>
                </dd>
              )}
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/assess">{glossary("scanFree")}</ButtonLink>
        </div>
      </section>

      <RelatedLinks path="/learn" />
    </PageShell>
  );
}
