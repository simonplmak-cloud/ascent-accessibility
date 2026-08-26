import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuditorWorkspace } from "@/components/auditor/auditor-workspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auditor" });
  return { title: t("title"), description: t("description") };
}

export default async function AuditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuditorWorkspace />;
}
