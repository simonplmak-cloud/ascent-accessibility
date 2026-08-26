import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { AuthForm } from "@/components/auth/auth-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title") };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <PageShell width="3xl">
      <div className="mx-auto max-w-md">
        <PageHeading>{t("title")}</PageHeading>
        <p className="mt-2 font-sans leading-7 text-terminal-muted">{t("intro")}</p>
        <AuthForm />
      </div>
    </PageShell>
  );
}
