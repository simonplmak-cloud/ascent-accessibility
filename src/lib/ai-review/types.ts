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

export interface VisionModel {
  review(input: {
    image: Buffer;
    prompt: string;
    system?: string;
    settings?: AiSettings;
  }): Promise<AiReview[]>;
}
