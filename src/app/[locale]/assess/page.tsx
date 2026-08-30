import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listStandards } from "@/lib/standards/catalog";
import { standardName } from "@/lib/standards/standards-locales";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import { AiReviewNote } from "@/components/assessment/ai-review-note";
import { BetaBadge } from "@/components/ui/beta-badge";
import { getSessionUser } from "@/server/auth";
import { resolveOwnerAi } from "@/server/byok";
import { getProvider } from "@/lib/ai-review/providers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "assessPage" });
  return { title: t("title"), description: t("description") };
}

export default async function AssessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("assessPage");
  const standards = listStandards().map((s) => ({ id: s.id, name: standardName(s.id, locale) }));

  const user = await getSessionUser();
  let ai = null;
  if (user) {
    try {
      ai = await resolveOwnerAi(user.id);
    } catch {
      ai = null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("heading")}</h1>
      <p className="mt-2 font-sans leading-7 text-terminal-muted">{t("intro")}</p>
      <div className="mt-3">
        <BetaBadge withDisclaimer />
      </div>
      <AiReviewNote
        hasAiKey={Boolean(ai)}
        providerLabel={ai ? getProvider(ai.providerId)?.label : undefined}
      />
      <div className="mt-8">
        <AssessmentForm standards={standards} />
      </div>
    </div>
  );
}

