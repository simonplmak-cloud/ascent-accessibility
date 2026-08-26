import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isReviewer } from "@/server/auth";
import { ReviewQueue } from "@/components/auditor/review-queue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviewPage" });
  return { title: t("title"), description: t("description") };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reviewPage");
  if (!(await isReviewer())) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-terminal-fg">{t("accessDenied")}</h1>
        <p className="mt-2 font-sans text-sm text-terminal-muted">
          {t("workforceOnly")}
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <ReviewQueue />
    </div>
  );
}
