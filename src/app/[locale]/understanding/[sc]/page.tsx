import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getSc, scTitle, understandingUrl } from "@/lib/standards/wcag-sc";
import { understandingFor } from "@/lib/standards/understanding";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { getScRemediation } from "@/lib/standards/sc-remediation";
import { PageShell } from "@/components/ui/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sc: string; locale: string }>;
}): Promise<Metadata> {
  const { sc, locale } = await params;
  const t = await getTranslations({ locale, namespace: "criterionPage" });
  const title = `${sc} ${scTitle(sc, locale)}`;
  return { title, description: t("disclaimer") };
}

export default async function UnderstandingPage({
  params,
}: {
  params: Promise<{ sc: string; locale: string }>;
}) {
  const { sc, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("criterionPage");
  const info = getSc(sc);
  if (!info) notFound();

  // English users get the authoritative W3C document directly.
  if (locale !== "zh-Hant" && locale !== "zh-Hans") {
    redirect(understandingUrl(info));
  }

  const content = understandingFor(sc, locale);

  return (
    <PageShell width="3xl">
      <Breadcrumbs
        trail={[{ href: "/standards", label: t("backToStandards") }, { label: sc }]}
      />
      <h1 className="mt-2 font-display text-3xl font-bold text-terminal-fg">
        {sc} {scTitle(sc, locale)}
      </h1>
      <p className="mt-1 font-sans text-xs uppercase text-terminal-muted">
        Level {info.level}
      </p>

      {content && (
        <>
          <section aria-labelledby="normative" className="mt-6">
            <h2 id="normative" className="font-display text-lg font-semibold text-terminal-fg">
              {t("normativeLabel")}
            </h2>
            <p className="mt-2 font-sans leading-7 text-terminal-fg">{content.normative}</p>
          </section>

          <section aria-labelledby="intent" className="mt-6">
            <h2 id="intent" className="font-display text-lg font-semibold text-terminal-fg">
              {t("intentLabel")}
            </h2>
            <p className="mt-2 font-sans leading-7 text-terminal-fg">{content.intent}</p>
          </section>

          <section aria-labelledby="benefits" className="mt-6">
            <h2 id="benefits" className="font-display text-lg font-semibold text-terminal-fg">
              {t("benefitsLabel")}
            </h2>
            <ul className="mt-2 list-disc pl-5 font-sans text-terminal-fg">
              {content.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="examples" className="mt-6">
            <h2 id="examples" className="font-display text-lg font-semibold text-terminal-fg">
              {t("examplesLabel")}
            </h2>
            <ul className="mt-2 list-disc pl-5 font-sans text-terminal-fg">
              {content.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section aria-labelledby="how-to-test" className="mt-6">
        <h2 id="how-to-test" className="font-display text-lg font-semibold text-terminal-fg">
          {t("howToTest")}
        </h2>
        <p className="mt-2 font-sans leading-7 text-terminal-fg">{getManualTest(sc, locale)}</p>
      </section>

      <section aria-labelledby="how-to-fix" className="mt-6">
        <h2 id="how-to-fix" className="font-display text-lg font-semibold text-terminal-fg">
          {t("howToFix")}
        </h2>
        <p className="mt-2 font-sans leading-7 text-terminal-fg">{getScRemediation(sc, locale)}</p>
      </section>

      <div className="mt-8 rounded border border-terminal-border bg-terminal-surface/40 p-4">
        <p className="font-sans text-sm text-terminal-muted">{t("disclaimer")}</p>
        {content?.source === "unofficial" && (
          <p className="mt-2 font-sans text-sm text-terminal-serious">{t("unofficialNote")}</p>
        )}
        <p className="mt-3">
          <a
            href={understandingUrl(info)}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
          >
            {t("officialReference")} · WCAG 2.2 Understanding {sc}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <p className="mt-2">
          <Link
            href="/standards"
            className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
          >
            {t("backToStandards")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
