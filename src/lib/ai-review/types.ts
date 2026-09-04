import type { AiSettings } from "./settings";

export type AiVerdict = "Passed" | "Failed" | "CannotTell";

export interface AiReview {
  sc: string;
  verdict: AiVerdict;
  confidence: number;
  reasoning: string;
  evidenceId?: string | null;
}

export interface AiBudget {
  calls: number;
  images: number;
}

// Optional tool-calling support: when provided, the vision client exposes the
// browser tools to the model and runs them via `run` (agentic loop).
export interface VisionReviewTools {
  run(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export interface VisionModel {
  review(input: {
    image: Buffer;
    prompt: string;
    system?: string | undefined;
    settings?: AiSettings | undefined;
    tools?: VisionReviewTools | undefined;
  }): Promise<AiReview[]>;
}
