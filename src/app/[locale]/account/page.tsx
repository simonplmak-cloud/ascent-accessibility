import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSessionUser } from "@/server/auth";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { ProfileForm } from "@/components/account/profile-form";
import { verifyTokenFor } from "@/lib/site/bot-identity";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("heading") };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const t = await getTranslations("account");

  return (
    <PageShell width="3xl">
      <PageHeading>{t("heading")}</PageHeading>
      <div className="mb-6">
        <ButtonLink href="/auditor" variant="outline" size="sm">
          {t("viewHistory")}
        </ButtonLink>
      </div>
      <div className="mb-6 rounded border border-terminal-border bg-terminal-surface/40 p-4">
        <h2 className="font-display text-lg font-semibold text-terminal-fg">
          {t("verifyTokenTitle")}
        </h2>
        <p className="mt-2 font-sans text-sm text-terminal-muted">{t("verifyTokenBody")}</p>
        <pre className="mt-3 overflow-x-auto rounded border border-terminal-border bg-terminal-surface/60 p-3 font-mono text-sm text-terminal-fg">
          {verifyTokenFor(user.id)}
        </pre>
      </div>
      <ProfileForm />
    </PageShell>
  );
}
