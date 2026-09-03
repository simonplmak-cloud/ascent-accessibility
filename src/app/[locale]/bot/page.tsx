import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { BOT_IP_RANGES, BOT_USER_AGENT, VERIFY_META_NAME } from "@/lib/site/bot-identity";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bot" });
  return { title: t("title"), description: t("description") };
}

export default async function BotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bot");

  return (
    <PageShell>
      <PageBreadcrumbs path="/bot" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("uaTitle")}</h2>
      <pre className="mt-3 overflow-x-auto rounded border border-terminal-border bg-terminal-surface/40 p-3 font-mono text-sm text-terminal-fg">
        {BOT_USER_AGENT}
      </pre>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("ipTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("ipBody")}</p>
      <pre className="mt-3 overflow-x-auto rounded border border-terminal-border bg-terminal-surface/40 p-3 font-mono text-sm text-terminal-fg">
        {BOT_IP_RANGES.length > 0 ? BOT_IP_RANGES.join("\n") : t("ipEmpty")}
      </pre>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("behaviorTitle")}</h2>
      <ul className="mt-3 list-inside list-disc font-sans leading-7 text-terminal-muted">
        <li>{t("behaviorRobots")}</li>
        <li>{t("behaviorDelay")}</li>
        <li>{t("behaviorNoAuth")}</li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("verifyTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        {t("verifyBody", { meta: VERIFY_META_NAME })}
      </p>
    </PageShell>
  );
}
