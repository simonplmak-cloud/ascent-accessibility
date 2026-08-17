export type AiVerdict = "pass" | "fail" | "needs-review";

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
  review(input: { image: Buffer; prompt: string }): Promise<AiReview[]>;
}
