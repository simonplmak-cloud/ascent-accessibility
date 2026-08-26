import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { BetaBadge } from "@/components/ui/beta-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plans" });
  return { title: t("title"), description: t("description") };
}

const freeKeys = ["free1", "free2", "free3", "free4", "free5", "free6"];
const byokKeys = ["byok1", "byok2", "byok3", "byok4"];
const humanKeys = ["human1", "human2", "human3", "human4", "human5"];

export default async function PricingPage() {
  const t = await getTranslations("plans");

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/pricing" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>
      <div className="mt-4">
        <BetaBadge withDisclaimer />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-terminal-fg">{t("freeTitle")}</h2>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">
            {t("freePrice")}
            <span className="text-base font-normal text-terminal-muted"> {t("freeSuffix")}</span>
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {freeKeys.map((key) => (
              <li key={key} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
          <ButtonLink href="/assess" className="mt-6 inline-block">
            {t("freeCta")}
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-terminal-fg">{t("aiTitle")}</h2>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">{t("aiPrice")}</p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {byokKeys.map((key) => (
              <li key={key} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
          <ButtonLink href="/assess" className="mt-6 inline-block">
            {t("aiCta")}
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-terminal-fg">{t("humanTitle")}</h2>
            <span className="rounded border border-terminal-serious px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-terminal-serious">
              {t("comingSoon")}
            </span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">
            {t("humanPrice")}
            <span className="text-base font-normal text-terminal-muted"> {t("humanSuffix")}</span>
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {humanKeys.map((key) => (
              <li key={key} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact" variant="outline" className="mt-6 inline-block">
            {t("registerInterest")}
          </ButtonLink>
        </Card>
      </div>

      <Card className="mt-6 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-terminal-fg">{t("openSourceTitle")}</h2>
          <p className="mt-1 font-sans text-sm text-terminal-muted">{t("openSourceBody")}</p>
        </div>
        <a
          href="https://github.com/humanity4ai/ascent-accessibility"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          {t("openSourceCta")}
        </a>
      </Card>

      <p className="mt-8 font-sans text-sm text-terminal-muted">
        {t.rich("supportNote", {
          donate: (chunks) => (
            <Link href="/donate" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          terms: (chunks) => (
            <Link href="/terms" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          refund: (chunks) => (
            <Link href="/refund" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          sla: (chunks) => (
            <Link href="/sla" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </p>
    </PageShell>
  );
}
