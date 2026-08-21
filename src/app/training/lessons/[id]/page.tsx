import Link from "next/link";
import { notFound } from "next/navigation";
import { PATH, getLesson } from "@/lib/training/curriculum";
import { getSc, understandingUrl } from "@/lib/standards/wcag-sc";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { getScRemediation } from "@/lib/standards/sc-remediation";
import { CompleteLessonButton } from "@/components/training/complete-lesson-button";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-sm text-terminal-muted">
        <Link href={`/training/paths/${PATH.id}`} className="underline-offset-4 hover:underline">
          {PATH.title}
        </Link>{" "}
        › {lesson.title}
      </p>
      <h1 className="mt-2 font-mono text-3xl font-bold text-terminal-fg">{lesson.title}</h1>

      {lesson.body && (
        <p className="mt-6 font-mono leading-7 text-terminal-fg">{lesson.body}</p>
      )}

      {lesson.type === "sc-reference" && (
        <div className="mt-6 space-y-6">
          {(lesson.scs ?? []).map((sc) => {
            const info = getSc(sc);
            if (!info) return null;
            return (
              <section key={sc} aria-labelledby={`sc-${sc}`} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
                <h2 id={`sc-${sc}`} className="font-mono text-lg font-semibold text-terminal-fg">
                  {sc} {info.title}
                </h2>
                <p className="mt-1 font-mono text-sm text-terminal-muted">
                  Principle {info.principle} · Level {info.level}
                </p>
                <dl className="mt-4 space-y-3 font-mono text-sm">
                  <div>
                    <dt className="text-terminal-muted">How to verify</dt>
                    <dd className="mt-1 text-terminal-fg">{getManualTest(sc)}</dd>
                  </div>
                  <div>
                    <dt className="text-terminal-muted">How to fix</dt>
                    <dd className="mt-1 text-terminal-fg">{getScRemediation(sc)}</dd>
                  </div>
                </dl>
                <p className="mt-3">
                  <a
                    href={understandingUrl(info)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
                  >
                    Understanding {sc} (opens in a new tab)
                  </a>
                </p>
              </section>
            );
          })}
        </div>
      )}

      {lesson.references && lesson.references.length > 0 && (
        <section aria-labelledby="lesson-refs" className="mt-8">
          <h2 id="lesson-refs" className="font-mono text-sm font-semibold text-terminal-fg">
            Further reading
          </h2>
          <ul className="mt-2 list-disc pl-5 font-mono text-sm text-terminal-muted">
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

      <CompleteLessonButton lessonId={lesson.id} />

      <p className="mt-4">
        <Link
          href={`/training/paths/${PATH.id}`}
          className="font-mono text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
        >
          Back to path
        </Link>
      </p>
    </div>
  );
}
