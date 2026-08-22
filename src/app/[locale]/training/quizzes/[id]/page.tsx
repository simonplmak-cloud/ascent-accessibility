import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/training/curriculum";
import { QuizRunner } from "@/components/training/quiz-runner";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = getQuiz(id);
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{quiz.title}</h1>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        Pass at {quiz.passThreshold}% · {quiz.questions.length} questions
      </p>
      <div className="mt-6">
        <QuizRunner id={id} />
      </div>
    </div>
  );
}
