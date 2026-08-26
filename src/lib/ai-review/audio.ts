import type { AiReview } from "./types";
import type { AiSettings } from "./settings";
import { buildTriageSystemPrompt } from "./prompt";

export interface AudioModel {
  review(input: {
    mediaUrls: string[];
    scs: string[];
    prompt: string;
    system?: string;
    settings?: AiSettings;
  }): Promise<AiReview[]>;
}

// Time-based-media SCs resolved by a Qwen omni/audio model. Fired only when the
// page has audio/video, so media-free pages never incur the call.
const MEDIA_SCS = ["1.2.1", "1.2.2", "1.2.3", "1.2.5", "1.4.7"];

export function mediaScsFor(features: { hasVideo: boolean; hasAudio: boolean }): string[] {
  return features.hasVideo || features.hasAudio ? MEDIA_SCS : [];
}

export async function runAudioReview(
  model: AudioModel,
  scs: string[],
  mediaUrls: string[],
  locale?: string,
): Promise<AiReview[]> {
  if (scs.length === 0 || mediaUrls.length === 0) return [];
  try {
    return await model.review({
      mediaUrls,
      scs,
      system: buildTriageSystemPrompt(locale),
      prompt:
        "Assess each WCAG time-based-media criterion against the provided media. " +
        "Return Passed / Failed / Cannot tell with a confidence from 0.0 to 1.0 " +
        "(promote only at confidence >= 0.8) and a reasoning.",
    });
  } catch {
    // Fail-safe: media-analysis errors leave every media SC Cannot tell.
    return scs.map((sc) => ({
      sc,
      verdict: "CannotTell",
      confidence: 0,
      reasoning: "audio model error",
    }));
  }
}
