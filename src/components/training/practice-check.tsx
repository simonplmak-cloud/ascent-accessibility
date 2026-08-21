"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/training/curriculum";

// Formative per-lesson practice check: one question, server-graded, with
// immediate correct/incorrect + explanation and a retry.
export function PracticeCheck({
  lessonId,
  question,
}: {
  lessonId: string;
  question: QuizQuestion;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (selected === null) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/training/lessons/${lessonId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerIndex: selected }),
      });
      if (!res.ok) throw new Error("check failed");
      setResult((await res.json()) as { correct: boolean; correctIndex: number; explanation: string });
    } catch {
      setError("Could not check your answer. Please try again.");
    }
  }

  function reset() {
    setSelected(null);
    setResult(null);
  }

  return (
    <div className="mt-6 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <h2 className="font-sans text-sm font-semibold text-terminal-fg">Practice check</h2>
      <p className="mt-2 font-sans text-sm text-terminal-fg">{question.prompt}</p>

      <div className="mt-2 space-y-2">
        {question.options.map((option, i) => (
          <label key={i} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
            <input
              type="radio"
              name={`check-${lessonId}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
              disabled={result !== null}
            />
            {option}
          </label>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}

      {result ? (
        <div className="mt-3">
          <p className="font-sans text-sm">
            <span className={result.correct ? "text-terminal-pass" : "text-terminal-fail"}>
              {result.correct ? "✓ Correct" : "✗ Not quite"}
            </span>
            {!result.correct && (
              <span className="text-terminal-muted">
                {" "}
                — correct answer: {question.options[result.correctIndex]}
              </span>
            )}
          </p>
          <p className="mt-1 font-sans text-sm text-terminal-muted">{result.explanation}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
          >
            Try again
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={selected === null}
          className="mt-3 rounded bg-terminal-fg px-3 py-1 font-sans text-sm text-terminal-bg hover:bg-terminal-serious disabled:opacity-50"
        >
          Check answer
        </button>
      )}
    </div>
  );
}
