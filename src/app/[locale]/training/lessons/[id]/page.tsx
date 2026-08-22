import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { curriculumFor } from "@/lib/training/curriculum";
import { getSc, understandingUrl } from "@/lib/standards/wcag-sc";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { getScRemediation } from "@/lib/standards/sc-remediation";
import { CompleteLessonButton } from "@/components/training/complete-lesson-button";
import { PracticeCheck } from "@/components/training/practice-check";
import { CapstoneChecklist } from "@/components/training/capstone-checklist";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("training");
  const { path, lessons, lessonMeta } = curriculumFor(locale);
  const lesson = lessons[id];
  if (!lesson) notFound();
  const meta = lessonMeta[id];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Breadcrumbs
        trail={[{ href: `/training/paths/${path.id}`, label: path.title }, { label: lesson.title }]}
      />
      <h1 className="mt-2 font-display text-3xl font-bold text-terminal-fg">{lesson.title}</h1>

      {meta && (
        <p className="mt-2 font-sans text-sm text-terminal-muted">
          {t("outcomeDuration", { outcome: meta.outcome, minutes: meta.durationMinutes })}
        </p>
      )}

      {lesson.body && (
        <p className="mt-6 font-sans leading-7 text-terminal-fg">{lesson.body}</p>
      )}

      {lesson.type === "sc-reference" && (
        <div className="mt-6 space-y-6">
          {(lesson.scs ?? []).map((sc) => {
            const info = getSc(sc);
            if (!info) return null;
            return (
              <section key={sc} aria-labelledby={`sc-${sc}`} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
                <h2 id={`sc-${sc}`} className="font-display text-lg font-semibold text-terminal-fg">
                  {sc} {info.title}
                </h2>
                <p className="mt-1 font-sans text-sm text-terminal-muted">
                  {t("principleLevel", { principle: info.principle, level: info.level })}
                </p>
                <dl className="mt-4 space-y-3 font-sans text-sm">
                  <div>
                    <dt className="text-terminal-muted">{t("howToVerify")}</dt>
                    <dd className="mt-1 text-terminal-fg">{getManualTest(sc)}</dd>
                  </div>
                  <div>
                    <dt className="text-terminal-muted">{t("howToFix")}</dt>
                    <dd className="mt-1 text-terminal-fg">{getScRemediation(sc)}</dd>
                  </div>
                </dl>
                <p className="mt-3">
                  <a
                    href={understandingUrl(info)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
                  >
                    {t("understandingSc", { sc })}
                  </a>
                </p>
              </section>
            );
          })}
        </div>
      )}

      {lesson.references && lesson.references.length > 0 && (
        <section aria-labelledby="lesson-refs" className="mt-8">
          <h2 id="lesson-refs" className="font-sans text-sm font-semibold text-terminal-fg">
            {t("furtherReading")}
          </h2>
          <ul className="mt-2 list-disc pl-5 font-sans text-sm text-terminal-muted">
            {lesson.references.map((ref) => (
              <li key={ref.href}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-terminal-fg"
                >
                  {ref.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson.id === "capstone-audit" && <CapstoneChecklist />}

      {meta?.check && <PracticeCheck lessonId={lesson.id} question={meta.check} />}

      <CompleteLessonButton lessonId={lesson.id} />

      <p className="mt-4">
        <Link
          href={`/training/paths/${path.id}`}
          className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
        >
          {t("backToPath")}
        </Link>
      </p>
    </div>
  );
}
