import { describe, expect, it } from "vitest";
import { getQuiz, PATH } from "@/lib/training/curriculum";
import { computePathProgress, gradeQuiz, missedQuestions } from "@/lib/training/quiz";

describe("gradeQuiz", () => {
  it("scores, passes, and reports per-question results", () => {
    const quiz = getQuiz("advocacy-quiz")!;
    const result = gradeQuiz(quiz, { a1: 1, a2: 0, a3: 2 });
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(3);
    expect(result.missed).toEqual([]);
  });

  it("fails below the threshold and lists missed questions", () => {
    const quiz = getQuiz("advocacy-quiz")!;
    const result = gradeQuiz(quiz, { a1: 1, a2: 2, a3: 1 });
    expect(result.score).toBeLessThan(80);
    expect(result.passed).toBe(false);
    expect(result.missed).toEqual(["a2", "a3"]);
  });

  it("treats an unanswered question as incorrect", () => {
    const quiz = getQuiz("perceivable-quiz")!;
    const result = gradeQuiz(quiz, { pr1: 1 });
    expect(result.missed).toContain("pr2");
  });
});

describe("missedQuestions", () => {
  it("returns only the missed questions for retry", () => {
    const quiz = getQuiz("advocacy-quiz")!;
    expect(missedQuestions(quiz, ["a2", "a3"]).map((q) => q.id)).toEqual(["a2", "a3"]);
  });
});

describe("computePathProgress", () => {
  it("reports a fraction and completion", () => {
    const activityIds = PATH.modules.flatMap((m) => m.activities.map((a) => a.id));
    const progress = computePathProgress(activityIds, new Set(["what-is-accessibility"]));
    expect(progress.fraction).toBe(`1/${activityIds.length}`);
    expect(progress.done).toBe(false);
  });

  it("flags done when all activities are complete", () => {
    const activityIds = PATH.modules.flatMap((m) => m.activities.map((a) => a.id));
    const progress = computePathProgress(activityIds, new Set(activityIds));
    expect(progress.done).toBe(true);
    expect(progress.completed).toBe(progress.total);
  });

  it("handles an empty path", () => {
    expect(computePathProgress([], new Set())).toEqual({
      completed: 0,
      total: 0,
      fraction: "0/0",
      done: false,
    });
  });
});
