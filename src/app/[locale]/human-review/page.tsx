import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "humanReviewPage" });
  return { title: t("title"), description: t("description") };
}

export default async function HumanReviewPage() {
  const t = await getTranslations("humanReviewPage");

  return (
    <PageShell width="4xl">
      <p className="inline-block rounded border border-terminal-serious px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-terminal-serious">
        {t("comingSoon")}
      </p>
      <PageBreadcrumbs path="/human-review" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("whyTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("whyBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("whatTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("whatBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("receiveTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        {t.rich("receiveBody", {
          link: (chunks) => (
            <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">
              {chunks}
            </Link>
          ),
        })}
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("meantimeTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("meantimeBody")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href="/assess">{t("scanFree")}</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          {t("registerInterest")}
        </ButtonLink>
      </div>
    </PageShell>
  );
}
