"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PATH } from "@/lib/training/curriculum";

interface QuizData {
  id: string;
  title: string;
  passThreshold: number;
  questions: Array<{ id: string; prompt: string; options: string[] }>;
}

interface QuizResult {
  score: number;
  passed: boolean;
  passThreshold: number;
  results: Array<{ questionId: string; correct: boolean; correctIndex: number; explanation: string; sc?: string }>;
  missed: string[];
}

export function QuizRunner({ id }: { id: string }) {
  const t = useTranslations("training");
  const locale = useLocale();
  const pathId = PATH.id;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/training/quizzes/${id}?locale=${locale}`);
        if (!res.ok) throw new Error("not found");
        setQuiz((await res.json()) as QuizData);
      } catch {
        setError(t("couldNotLoadQuiz"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, locale]);

  async function submit() {
    setError(null);
    try {
      const res = await fetch(`/api/v1/training/quizzes/${id}?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("submit failed");
      const r = (await res.json()) as QuizResult;
      setResult(r);
      // Best-effort progress save (ignored silently when signed out).
      await fetch("/api/v1/training/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathId,
          activity: id,
          status: r.passed ? "completed" : "needs_retry",
          score: r.score,
        }),
      }).catch(() => {});
    } catch {
      setError(t("couldNotSubmitQuiz"));
    }
  }

  if (loading) {
    return <p className="font-sans text-sm text-terminal-muted">{t("loading")}</p>;
  }
  if (!quiz) {
    return (
      <p role="alert" className="font-sans text-sm text-terminal-critical">
        {error ?? t("quizNotFound")}
      </p>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-terminal-fg">{t("results")}</h2>
        <p role="status" className="font-sans text-sm text-terminal-fg">
          {result.score}/100 ·{" "}
          {result.passed ? (
            <span className="text-terminal-pass">{t("passed")}</span>
          ) : (
            <span className="text-terminal-fail">
              {t("notYetPassed", { threshold: result.passThreshold })}
            </span>
          )}
        </p>
        <ul className="space-y-3">
          {quiz.questions.map((q) => {
            const r = result.results.find((x) => x.questionId === q.id)!;
            return (
              <li key={q.id} className="rounded border border-terminal-border bg-terminal-surface/40 p-3 font-sans text-sm">
                <p className="text-terminal-fg">{q.prompt}</p>
                <p className="mt-1">
                  <span className={r.correct ? "text-terminal-pass" : "text-terminal-fail"}>
                    {r.correct ? "✓" : "✗"}
                  </span>{" "}
                  <span className="text-terminal-fg">{q.options[r.correctIndex]}</span>
                </p>
                {!r.correct && <p className="mt-1 text-terminal-muted">{r.explanation}</p>}
              </li>
            );
          })}
        </ul>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            {t("retake")}
          </Button>
          <Link href={`/training/paths/${pathId}`} className="font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious">
            {t("backToPath")}
          </Link>
        </div>
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (allAnswered) void submit();
      }}
      className="space-y-6"
    >
      {quiz.questions.map((q, i) => (
        <fieldset key={q.id}>
          <legend className="font-sans text-sm font-semibold text-terminal-fg">
            {t("questionHeading", { index: i + 1, total: quiz.questions.length })} — {q.prompt}
          </legend>
          <div className="mt-2 space-y-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!allAnswered}>
        {t("submit")}
      </Button>
    </form>
  );
}
