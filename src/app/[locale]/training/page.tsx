import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { curriculumFor } from "@/lib/training/curriculum";
import { computePathProgress } from "@/lib/training/quiz";
import { trainingRepository } from "@/db/repository";
import type { Credential, LearnerProgress } from "@/db/repository/training-repository";
import { getSessionUser } from "@/server/auth";
import { ClaimCertificateButton } from "@/components/training/claim-certificate-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "training" });
  return { title: t("title"), description: t("description") };
}

export default async function TrainingDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("training");
  const { path, lessons, quizzes } = curriculumFor(locale);
  const user = await getSessionUser();
  const activityIds = path.modules.flatMap((m) => m.activities.map((a) => a.id));

  let progress: LearnerProgress[] = [];
  let credentials: Credential[] = [];
  if (user) {
    progress = await trainingRepository.listProgress(user.id);
    credentials = await trainingRepository.listCredentials(user.id);
  }

  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.activity),
  );
  const pathProgress = computePathProgress(activityIds, completed);
  const nextActivity = activityIds.find((id) => !completed.has(id));
  const quizIds = path.modules
    .flatMap((m) => m.activities.filter((a) => a.type === "quiz").map((a) => a.id));
  const quizScores = progress
    .filter((p) => quizIds.includes(p.activity) && p.score != null)
    .map((p) => p.score as number);
  const avgScore = quizScores.length
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : null;
  const hasCredential = credentials.some((c) => c.path === path.id);
  const nextHref = nextActivity
    ? lessons[nextActivity]
      ? `/training/lessons/${nextActivity}`
      : quizzes[nextActivity]
        ? `/training/quizzes/${nextActivity}`
        : `/training/paths/${path.id}`
    : `/training/paths/${path.id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("heading")}</h1>
      <p className="mt-2 font-sans leading-7 text-terminal-muted">{t("intro")}</p>

      <section aria-labelledby="path-heading" className="mt-8">
        <h2 id="path-heading" className="font-display text-lg font-semibold text-terminal-fg">
          {t("learningPath")}
        </h2>
        <div className="mt-4 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-display text-lg font-semibold text-terminal-fg">{path.title}</p>
          <p className="mt-1 font-sans text-sm text-terminal-muted">
            {t("pathSummary", { modules: path.modules.length, activities: activityIds.length })}
          </p>
          {user && (
            <p className="mt-2 font-sans text-sm text-terminal-fg">
              {t("progress", { fraction: pathProgress.fraction })}
              {pathProgress.done && <span className="text-terminal-pass">{t("completeCheck")}</span>}
            </p>
          )}
          <div className="mt-4">
            <Link
              href={nextHref}
              className="inline-block rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
            >
              {nextActivity ? t("continueLearning") : t("viewPath")}
            </Link>
          </div>
          {user && pathProgress.done && !hasCredential && (
            <div className="mt-4">
              <ClaimCertificateButton
                path={path.id}
                pathVersion={path.version}
                score={avgScore}
              />
            </div>
          )}
        </div>
      </section>

      {user && credentials.length > 0 && (
        <section aria-labelledby="credential-heading" className="mt-8">
          <h2 id="credential-heading" className="font-display text-lg font-semibold text-terminal-fg">
            {t("credentials")}
          </h2>
          <ul className="mt-3 space-y-2">
            {credentials.map((cred) => (
              <li
                key={cred.id}
                className="flex items-center justify-between rounded border border-terminal-border bg-terminal-surface/40 px-3 py-2 font-sans text-sm"
              >
                <span className="text-terminal-fg">
                  {cred.path} (v{cred.pathVersion})
                </span>
                <Link
                  href={`/training/certificate/${cred.id}`}
                  className="text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
                >
                  {t("viewPdf")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 font-sans text-sm text-terminal-muted">
        {user ? t("signedInNote") : t("signedOutNote")}{" "}
        <Link href="/training/faq" className="underline underline-offset-4 hover:text-terminal-fg">
          {t("courseFaq")}
        </Link>
      </p>
    </div>
  );
}
