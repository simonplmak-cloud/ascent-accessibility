import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/card";
import { DisplayPreferences } from "@/components/shell/display-preferences";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: t("displayAndLanguage") };
}

// Visible settings: language / text size / theme as always-visible radio groups.
// Replaces the former gear-icon preferences dialog.
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <PageShell width="3xl">
      <PageHeading>{t("displayAndLanguage")}</PageHeading>
      <Card className="p-6">
        <DisplayPreferences />
      </Card>
    </PageShell>
  );
}
