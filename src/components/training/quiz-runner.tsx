"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v1/training/quizzes/${id}`);
        if (!res.ok) throw new Error("not found");
        setQuiz((await res.json()) as QuizData);
      } catch {
        setError("Could not load this quiz.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function submit() {
    setError(null);
    try {
      const res = await fetch(`/api/v1/training/quizzes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("submit failed");
      setResult((await res.json()) as QuizResult);
    } catch {
      setError("Could not submit your answers.");
    }
  }

  if (loading) {
    return <p className="font-mono text-sm text-terminal-muted">Loading…</p>;
  }
  if (!quiz) {
    return (
      <p role="alert" className="font-mono text-sm text-terminal-critical">
        {error ?? "Quiz not found."}
      </p>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <h2 className="font-mono text-lg font-semibold text-terminal-fg">Results</h2>
        <p role="status" className="font-mono text-sm text-terminal-fg">
          {result.score}/100 ·{" "}
          {result.passed ? (
            <span className="text-terminal-pass">Passed</span>
          ) : (
            <span className="text-terminal-fail">
              Not yet passed · {result.passThreshold}% required
            </span>
          )}
        </p>
        <ul className="space-y-3">
          {quiz.questions.map((q) => {
            const r = result.results.find((x) => x.questionId === q.id)!;
            return (
              <li key={q.id} className="rounded border border-terminal-border bg-terminal-surface/40 p-3 font-mono text-sm">
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
            Retake
          </Button>
          <Link href={`/training/paths/${PATH.id}`} className="font-mono text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious">
            Back to path
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
          <legend className="font-mono text-sm font-semibold text-terminal-fg">
            Q {i + 1} of {quiz.questions.length} — {q.prompt}
          </legend>
          <div className="mt-2 space-y-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
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
        <p role="alert" className="font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!allAnswered}>
        Submit
      </Button>
    </form>
  );
}
