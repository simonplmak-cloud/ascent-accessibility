import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { curriculumFor } from "@/lib/training/curriculum";
import { QuizRunner } from "@/components/training/quiz-runner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("training");
  const { quizzes } = curriculumFor(locale);
  const quiz = quizzes[id];
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{quiz.title}</h1>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("passAt", { threshold: quiz.passThreshold, count: quiz.questions.length })}
      </p>
      <div className="mt-6">
        <QuizRunner id={id} />
      </div>
    </div>
  );
}
