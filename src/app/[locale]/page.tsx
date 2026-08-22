import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSessionUser } from "@/server/auth";
import { assessmentRepository } from "@/db/repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("heroTitle"),
    description: t("heroSubtitle"),
  };
}

const steps = [
  { n: 1, titleKey: "step1Title", bodyKey: "step1Body" },
  { n: 2, titleKey: "step2Title", bodyKey: "step2Body" },
  { n: 3, titleKey: "step3Title", bodyKey: "step3Body" },
];

const sampleIssues = [
  { impact: "critical", textKey: "sampleIssue1", sc: "1.1.1", by: "Machine" },
  { impact: "serious", textKey: "sampleIssue2", sc: "1.4.3", by: "Machine" },
  { impact: "needs human", textKey: "sampleIssue3", sc: "2.4.7", by: "Needs human" },
];

const personas = [
  { titleKey: "persona1Title", bodyKey: "persona1Body", href: "/for-government" },
  { titleKey: "persona2Title", bodyKey: "persona2Body", href: "/for-ngos" },
  { titleKey: "persona3Title", bodyKey: "persona3Body", href: "/esg" },
  { titleKey: "persona4Title", bodyKey: "persona4Body", href: "/training" },
];

const outcomes = [
  { titleKey: "outcome1Title", bodyKey: "outcome1Body" },
  { titleKey: "outcome2Title", bodyKey: "outcome2Body" },
  { titleKey: "outcome3Title", bodyKey: "outcome3Body" },
  { titleKey: "outcome4Title", bodyKey: "outcome4Body" },
];

const trustPointKeys = ["trustPoint1", "trustPoint2", "trustPoint3", "trustPoint4"];

const impactClass: Record<string, string> = {
  critical: "text-terminal-critical",
  serious: "text-terminal-serious",
  "needs human": "text-terminal-moderate",
};

export default async function Home() {
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");

  // A1: a signed-in returning user gets a one-click path back to their latest report.
  // Fail-open: if the database is unreachable we simply hide the link.
  const user = await getSessionUser();
  let latestReportHref: string | null = null;
  if (user) {
    try {
      const assessments = await assessmentRepository.list(user.id, 20);
      const latestCompleted = assessments.find((a) => a.status === "completed");
      if (latestCompleted) {
        latestReportHref = `/auditor/report/${encodeURIComponent(latestCompleted.id)}`;
      }
    } catch {
      latestReportHref = null;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* 1 · Hero */}
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-terminal-fg">
          {t("heroTitle")}
        </h1>
        <p className="mt-4 font-sans text-lg text-terminal-muted">{t("heroSubtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-sans text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            {t("scanFree")}
          </Link>
          <a
            href="#sample-report"
            className="rounded border border-terminal-border px-6 py-3 font-sans text-base font-medium text-terminal-fg hover:border-terminal-serious"
          >
            {t("seeSample")}
          </a>
        </div>
        {latestReportHref && (
          <p className="mt-4 font-sans text-sm text-terminal-muted">
            {t.rich("welcomeBack", {
              link: (chunks) => (
                <Link
                  href={latestReportHref}
                  className="text-brandLink underline underline-offset-4 hover:text-brand"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </section>

      {/* 2 · The difference */}
      <section className="mt-20" aria-labelledby="difference">
        <h2 id="difference" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("differenceTitle")}
        </h2>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">
          {t("differenceBody")}
        </p>
      </section>

      {/* 3 · How it works */}
      <section className="mt-20" aria-labelledby="how">
        <h2 id="how" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("howTitle")}
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
              <p className="font-display text-2xl font-bold text-brand">{step.n}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-terminal-fg">
                {t(step.titleKey)}
              </h3>
              <p className="mt-1 font-sans text-sm text-terminal-muted">{t(step.bodyKey)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 · Sample report */}
      <section id="sample-report" className="mt-20 scroll-mt-24" aria-labelledby="sample">
        <h2 id="sample" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("sampleTitle")}
        </h2>
        <div className="mt-6 max-w-2xl rounded border border-terminal-border bg-terminal-surface p-5 shadow-card">
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="font-display text-3xl font-bold text-terminal-fg">
              72<span className="text-lg text-terminal-muted">/100</span>
            </p>
            <p className="font-sans text-sm font-medium text-terminal-serious">{t("sampleBand")}</p>
          </div>
          <p className="mt-1 font-sans text-xs text-terminal-muted">{t("sampleCaption")}</p>
          <ul className="mt-3 space-y-2">
            {sampleIssues.map((issue) => (
              <li
                key={issue.sc}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded border border-terminal-border px-3 py-2"
              >
                <span className={`font-sans text-xs font-semibold uppercase ${impactClass[issue.impact]}`}>
                  {issue.impact}
                </span>
                <span className="font-sans text-sm text-terminal-fg">{t(issue.textKey)}</span>
                <span className="font-sans text-xs text-terminal-muted">WCAG {issue.sc}</span>
                <span className="ml-auto font-sans text-xs text-terminal-muted">{issue.by}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-sans text-xs text-terminal-muted">{t("sampleNote")}</p>
        </div>
      </section>

      {/* 5 · Who it's for */}
      <section className="mt-20" aria-labelledby="who">
        <h2 id="who" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("whoTitle")}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {personas.map((persona) => (
            <Link
              key={persona.titleKey}
              href={persona.href}
              className="rounded border border-terminal-border bg-terminal-surface/40 p-4 hover:border-terminal-serious"
            >
              <h3 className="font-display text-base font-semibold text-terminal-fg">
                {t(persona.titleKey)}
              </h3>
              <p className="mt-1 font-sans text-sm text-terminal-muted">{t(persona.bodyKey)}</p>
              <p className="mt-2 font-sans text-xs text-brandLink">{t("learnMore")}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 · What you get */}
      <section className="mt-20" aria-labelledby="outcomes">
        <h2 id="outcomes" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("outcomesTitle")}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {outcomes.map((outcome) => (
            <div key={outcome.titleKey}>
              <h3 className="font-display text-lg font-semibold text-terminal-fg">
                {t(outcome.titleKey)}
              </h3>
              <p className="mt-2 font-sans text-terminal-muted">{t(outcome.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 · Why you can trust it */}
      <section className="mt-20" aria-labelledby="trust">
        <h2 id="trust" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("trustTitle")}
        </h2>
        <ul className="mt-6 max-w-3xl space-y-3">
          {trustPointKeys.map((key) => (
            <li key={key} className="flex gap-3 font-sans leading-7 text-terminal-muted">
              <span aria-hidden="true" className="text-terminal-pass">✓</span>
              {t(key)}
            </li>
          ))}
        </ul>
      </section>

      {/* 8 · From our founder */}
      <section className="mt-20 rounded border border-terminal-border bg-terminal-surface/40 p-6" aria-labelledby="founder">
        <h2 id="founder" className="font-display text-2xl font-semibold text-terminal-fg">
          {t("founderTitle")}
        </h2>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">{t("founderBody1")}</p>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">
          {t("founderBody2")}{" "}
          <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">
            {t("founderEsgLink")}
          </Link>
          {" · "}
          <a
            href="https://www.simonmak.com"
            target="_blank"
            rel="noreferrer"
            className="text-brandLink underline underline-offset-4 hover:text-brand"
          >
            simonmak.com<span className="sr-only"> (opens in a new window)</span>
          </a>
          .
        </p>
      </section>

      {/* 9 · Trust strip + closing CTA */}
      <section className="mt-20 border-t border-terminal-border pt-10" aria-labelledby="learn-more">
        <h2 id="learn-more" className="sr-only">
          {t("whoTitle")}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-sm text-terminal-muted">
            <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("methodology")}</Link>{" · "}
            <Link href="/guides" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("guides")}</Link>{" · "}
            <Link href="/glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("glossary")}</Link>{" · "}
            <Link href="/validation" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("validation")}</Link>{" · "}
            <Link href="/accessibility-statement" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("accessibilityStatement")}</Link>{" · "}
            <Link href="/human-review" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("humanReview")}</Link>{" · "}
            <Link href="/privacy" className="text-brandLink underline underline-offset-4 hover:text-brand">{tn("privacy")}</Link>
          </p>
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-sans text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            {t("closingCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
