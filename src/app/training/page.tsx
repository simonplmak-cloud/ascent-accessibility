import Link from "next/link";
import type { Metadata } from "next";
import { PATH, getLesson, getQuiz } from "@/lib/training/curriculum";
import { computePathProgress } from "@/lib/training/quiz";
import { trainingRepository } from "@/db/repository";
import type { Credential, LearnerProgress } from "@/db/repository/training-repository";
import { getSessionUser } from "@/server/auth";
import { ClaimCertificateButton } from "@/components/training/claim-certificate-button";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Free, structured WCAG training. Learn web accessibility, pass the assessments, and earn a PDF certificate.",
};

export default async function TrainingDashboardPage() {
  const user = await getSessionUser();
  const activityIds = PATH.modules.flatMap((m) => m.activities.map((a) => a.id));

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
  const quizIds = PATH.modules
    .flatMap((m) => m.activities.filter((a) => a.type === "quiz").map((a) => a.id));
  const quizScores = progress
    .filter((p) => quizIds.includes(p.activity) && p.score != null)
    .map((p) => p.score as number);
  const avgScore = quizScores.length
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : null;
  const hasCredential = credentials.some((c) => c.path === PATH.id);
  const nextHref = nextActivity
    ? getLesson(nextActivity)
      ? `/training/lessons/${nextActivity}`
      : getQuiz(nextActivity)
        ? `/training/quizzes/${nextActivity}`
        : `/training/paths/${PATH.id}`
    : `/training/paths/${PATH.id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Training</h1>
      <p className="mt-2 font-mono leading-7 text-terminal-muted">
        A free, self-paced path to understanding WCAG 2.2 — lessons, assessments, and a
        downloadable certificate. No paywall.
      </p>

      <section aria-labelledby="path-heading" className="mt-8">
        <h2 id="path-heading" className="font-mono text-lg font-semibold text-terminal-fg">
          Learning path
        </h2>
        <div className="mt-4 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-mono text-lg font-semibold text-terminal-fg">{PATH.title}</p>
          <p className="mt-1 font-mono text-sm text-terminal-muted">
            {PATH.modules.length} modules · {activityIds.length} activities · 100% free —
            including the certificate
          </p>
          {user && (
            <p className="mt-2 font-mono text-sm text-terminal-fg">
              Progress {pathProgress.fraction}
              {pathProgress.done && <span className="text-terminal-pass"> · complete ✓</span>}
            </p>
          )}
          <div className="mt-4">
            <Link
              href={nextHref}
              className="inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
            >
              {nextActivity ? "Continue learning" : "View path"}
            </Link>
          </div>
          {user && pathProgress.done && !hasCredential && (
            <div className="mt-4">
              <ClaimCertificateButton
                path={PATH.id}
                pathVersion={PATH.version}
                score={avgScore}
              />
            </div>
          )}
        </div>
      </section>

      {user && credentials.length > 0 && (
        <section aria-labelledby="credential-heading" className="mt-8">
          <h2 id="credential-heading" className="font-mono text-lg font-semibold text-terminal-fg">
            Credentials
          </h2>
          <ul className="mt-3 space-y-2">
            {credentials.map((cred) => (
              <li
                key={cred.id}
                className="flex items-center justify-between rounded border border-terminal-border bg-terminal-surface/40 px-3 py-2 font-mono text-sm"
              >
                <span className="text-terminal-fg">
                  {cred.path} (v{cred.pathVersion})
                </span>
                <Link
                  href={`/training/certificate/${cred.id}`}
                  className="text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
                >
                  View · PDF
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 font-mono text-sm text-terminal-muted">
        {user ? "Signed in — progress is saved automatically." : "Sign in to save your progress and earn the certificate."}{" "}
        <Link href="/training/faq" className="underline underline-offset-4 hover:text-terminal-fg">
          Course FAQ
        </Link>
      </p>
    </div>
  );
}
