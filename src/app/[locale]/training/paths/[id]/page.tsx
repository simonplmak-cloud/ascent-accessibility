import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { curriculumFor } from "@/lib/training/curriculum";

export default async function PathOverviewPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("training");
  const { path, lessons, quizzes, lessonMeta } = curriculumFor(locale);
  if (id !== path.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{path.title}</h1>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("versionFree", { version: path.version })}
      </p>

      <div className="mt-8 space-y-8">
        {path.modules.map((module, index) => (
          <section key={module.id} aria-labelledby={`module-${module.id}`} className="rounded border border-terminal-border bg-terminal-surface/40">
            <h2 id={`module-${module.id}`} className="m-0 px-3 py-2 font-display text-lg font-semibold text-terminal-fg">
              <span className="mr-2 text-terminal-muted">{index + 1} ·</span>
              {module.title}
              <span className="ml-2 font-normal text-terminal-muted">
                ({module.activities.length})
              </span>
            </h2>
            <div className="border-t border-terminal-border px-3 py-3">
              <p className="font-sans text-sm text-terminal-muted">{module.description}</p>
              <ul className="mt-3 space-y-2">
                {module.activities.map((activity) => {
                  const lesson = activity.type === "lesson" ? lessons[activity.id] : undefined;
                  const label =
                    activity.type === "lesson"
                      ? (lesson?.title ?? activity.id)
                      : (quizzes[activity.id]?.title ?? activity.id);
                  const href =
                    activity.type === "lesson"
                      ? `/training/lessons/${activity.id}`
                      : `/training/quizzes/${activity.id}`;
                  const meta = lesson ? lessonMeta[activity.id] : undefined;
                  const detail =
                    activity.type === "lesson"
                      ? `${t("lessonLabel")}${meta ? ` · ${t("minutesSuffix", { minutes: meta.durationMinutes })}` : ""}`
                      : t("quizLabel");
                  return (
                    <li key={activity.id} className="rounded border border-terminal-border bg-terminal-surface/40 px-3 py-2">
                      <Link
                        href={href}
                        className="flex items-center justify-between font-sans text-sm text-terminal-fg hover:underline"
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
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
