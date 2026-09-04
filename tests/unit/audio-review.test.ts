import { describe, expect, it, vi } from "vitest";
import { mediaScsFor, runAudioReview, type AudioModel } from "@/lib/ai-review/audio";
import type { AiReview } from "@/lib/ai-review/types";

describe("mediaScsFor", () => {
  it("returns media SCs only when audio/video is present", () => {
    expect(mediaScsFor({ hasVideo: true, hasAudio: false })).toHaveLength(5);
    expect(mediaScsFor({ hasVideo: false, hasAudio: false })).toEqual([]);
  });
});

describe("runAudioReview", () => {
  it("does not call the model for media-free pages (AC-13)", async () => {
    const model: AudioModel = { review: vi.fn(async (): Promise<AiReview[]> => []) };
    const out = await runAudioReview(model, [], []);
    expect(out).toEqual([]);
    expect(model.review).not.toHaveBeenCalled();
  });

  it("returns the model verdicts when media is present (AC-13)", async () => {
    const model: AudioModel = {
      review: vi.fn(async (): Promise<AiReview[]> => [
        { sc: "1.2.2", verdict: "Passed", confidence: 0.9, reasoning: "captions match" },
      ]),
    };
    const out = await runAudioReview(model, ["1.2.2"], ["https://x.example/video.mp4"]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ verdict: "Passed" });
  });

  it("fails safe to CannotTell on model error (AC-13)", async () => {
    const model: AudioModel = { review: async () => Promise.reject(new Error("boom")) };
    const out = await runAudioReview(model, ["1.2.2"], ["https://x.example/video.mp4"]);
    expect(out).toEqual([
      { sc: "1.2.2", verdict: "NotTested", confidence: 0, reasoning: "audio model error" },
    ]);
  });
});
