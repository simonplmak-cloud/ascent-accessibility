import { describe, expect, it } from "vitest";
import { LESSON_META, PATH } from "@/lib/training/curriculum";

const lessonIds = PATH.modules
  .flatMap((m) => m.activities.filter((a) => a.type === "lesson").map((a) => a.id));

describe("LESSON_META coverage", () => {
  it("has meta for every lesson in the path", () => {
    expect(lessonIds.length).toBeGreaterThanOrEqual(32);
    for (const id of lessonIds) {
      expect(LESSON_META[id], `missing meta for ${id}`).toBeDefined();
    }
  });

  it("keeps outcomes, durations, and checks within the size caps", () => {
    for (const [id, meta] of Object.entries(LESSON_META)) {
      expect(meta.outcome.split(/\s+/).length, `${id} outcome too long`).toBeLessThanOrEqual(15);
      expect(meta.durationMinutes).toBeGreaterThanOrEqual(5);
      expect(meta.durationMinutes).toBeLessThanOrEqual(30);
      expect(meta.check.options.length).toBeGreaterThanOrEqual(2);
      expect(meta.check.options.length).toBeLessThanOrEqual(4);
      expect(meta.check.prompt.split(/\s+/).length, `${id} prompt too long`).toBeLessThanOrEqual(30);
      expect(meta.check.explanation.split(/\s+/).length, `${id} explanation too long`).toBeLessThanOrEqual(25);
    }
  });
});
