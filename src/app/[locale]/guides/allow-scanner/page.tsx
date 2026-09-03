import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { BOT_IP_RANGES, BOT_USER_AGENT } from "@/lib/site/bot-identity";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "allowScanner" });
  return { title: t("title"), description: t("description") };
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded border border-terminal-border bg-terminal-surface/40 p-3 font-mono text-xs leading-6 text-terminal-fg">
      {code}
    </pre>
  );
}

const ROBOTS_SNIPPET = `User-agent: AscentAccessibilityBot
Allow: /`;

const CLOUDFLARE_SNIPPET = `# Security → WAF → Custom rule → Skip
# Field: User Agent — Operator: contains — Value: AscentAccessibilityBot
# Action: Skip (or Allow)`;

const NGINX_SNIPPET = `# Allow the Ascent Accessibility scanner
location / {
    if ($http_user_agent ~* "AscentAccessibilityBot") {
        return 200;
    }
}`;

export default async function AllowScannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("allowScanner");

  return (
    <PageShell>
      <PageBreadcrumbs path="/guides/allow-scanner" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <p className="mt-6 font-sans leading-7 text-terminal-muted">
        {t("identityNote")}{" "}
        <code className="text-terminal-fg">{BOT_USER_AGENT}</code>
        {BOT_IP_RANGES.length > 0 && (
          <>
            {" "}
            {t("ipNote")} <code className="text-terminal-fg">{BOT_IP_RANGES.join(", ")}</code>
          </>
        )}
        .
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("robotsTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("robotsBody")}</p>
      <Snippet code={ROBOTS_SNIPPET} />

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("cloudflareTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("cloudflareBody")}</p>
      <Snippet code={CLOUDFLARE_SNIPPET} />

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("nginxTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("nginxBody")}</p>
      <Snippet code={NGINX_SNIPPET} />

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("verifyTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        {t("verifyBody")}{" "}
        <Link
          href="/bot"
          className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
        >
          {t("verifyLink")}
        </Link>
        .
      </p>
    </PageShell>
  );
}
