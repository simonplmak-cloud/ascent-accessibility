import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { LegalNote } from "@/components/legal/legal-note";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const collectItems: Array<[string, string]> = [
    [t("c1a"), t("c1aBody")],
    [t("c1b"), t("c1bBody")],
    [t("c1c"), t("c1cBody")],
    [t("c1d"), t("c1dBody")],
  ];

  return (
    <PageShell>
      <PageBreadcrumbs path="/privacy" title={t("heading")} />

      <PageHeading>{t("heading")}</PageHeading>
      <p className="mt-3 font-sans text-sm text-terminal-muted">{t("lastUpdated")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("c1Title")}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 font-sans leading-7 text-terminal-muted">
        {collectItems.map(([label, body]) => (
          <li key={label}>
            <strong className="text-terminal-fg">{label}</strong> — {body}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("c2Title")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("c2Body")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("c3Title")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("c3Body")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("c4Title")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("c4Body")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("c5Title")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        {t.rich("c5Body", {
          mail: (chunks) => <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">{chunks}</a>,
        })}
      </p>

      <LegalNote label={t("label")} />
    </PageShell>
  );
}
