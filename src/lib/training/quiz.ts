// Quiz grading + progress math — pure, node-testable. Answer keys stay server-side.

import type { Quiz, QuizQuestion } from "./curriculum";

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
  sc?: string;
}

export interface QuizResult {
  score: number; // 0–100
  passed: boolean;
  passThreshold: number;
  results: QuestionResult[];
  missed: string[]; // question ids answered incorrectly
}

export function gradeQuiz(
  quiz: Quiz,
  answers: Record<string, number>,
): QuizResult {
  const results: QuestionResult[] = quiz.questions.map((q) => {
    const chosen = answers[q.id];
    const correct = chosen === q.answerIndex;
    return {
      questionId: q.id,
      correct,
      correctIndex: q.answerIndex,
      explanation: q.explanation,
      sc: q.sc,
    };
  });

  const correct = results.filter((r) => r.correct).length;
  const score = quiz.questions.length === 0 ? 0 : Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= quiz.passThreshold;
  const missed = results.filter((r) => !r.correct).map((r) => r.questionId);

  return { score, passed, passThreshold: quiz.passThreshold, results, missed };
}

/** Filter a quiz to only the questions the learner got wrong (retry-missed). */
export function missedQuestions(quiz: Quiz, missedIds: string[]): QuizQuestion[] {
  const set = new Set(missedIds);
  return quiz.questions.filter((q) => set.has(q.id));
}

// Progress is completion over required activities, shown as a fraction.
export interface PathProgress {
  completed: number;
  total: number;
  fraction: string; // "18/24"
  done: boolean;
}

export function computePathProgress(
  activityIds: readonly string[],
  completed: ReadonlySet<string>,
): PathProgress {
  const doneCount = activityIds.filter((id) => completed.has(id)).length;
  return {
    completed: doneCount,
    total: activityIds.length,
    fraction: `${doneCount}/${activityIds.length}`,
    done: doneCount === activityIds.length && activityIds.length > 0,
  };
}
