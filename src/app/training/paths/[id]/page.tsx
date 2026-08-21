import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSON_META, PATH, getLesson, getQuiz } from "@/lib/training/curriculum";

export default async function PathOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== PATH.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">{PATH.title}</h1>
      <p className="mt-1 font-mono text-sm text-terminal-muted">
        v{PATH.version} · 100% free — including the certificate
      </p>

      <div className="mt-8 space-y-8">
        {PATH.modules.map((module, index) => (
          <section key={module.id} aria-labelledby={`module-${module.id}`}>
            <h2 id={`module-${module.id}`} className="font-mono text-lg font-semibold text-terminal-fg">
              <span className="mr-2 text-terminal-muted">{index + 1} ·</span>
              {module.title}
            </h2>
            <p className="mt-1 font-mono text-sm text-terminal-muted">{module.description}</p>
            <ul className="mt-3 space-y-2">
              {module.activities.map((activity) => {
                const lesson = activity.type === "lesson" ? getLesson(activity.id) : undefined;
                const label =
                  activity.type === "lesson"
                    ? (lesson?.title ?? activity.id)
                    : (getQuiz(activity.id)?.title ?? activity.id);
                const href =
                  activity.type === "lesson"
                    ? `/training/lessons/${activity.id}`
                    : `/training/quizzes/${activity.id}`;
                const meta = lesson ? LESSON_META[activity.id] : undefined;
                const detail =
                  activity.type === "lesson"
                    ? `Lesson${meta ? ` · ~${meta.durationMinutes} min` : ""}`
                    : "Quiz";
                return (
                  <li key={activity.id} className="rounded border border-terminal-border bg-terminal-surface/40 px-3 py-2">
                    <Link
                      href={href}
                      className="flex items-center justify-between font-mono text-sm text-terminal-fg hover:underline"
                    >
                      <span>
                        <span className="mr-2 text-terminal-muted">{activity.type === "lesson" ? "▸" : "✓"}</span>
                        {label}
                      </span>
                      <span className="text-terminal-muted">{detail}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
