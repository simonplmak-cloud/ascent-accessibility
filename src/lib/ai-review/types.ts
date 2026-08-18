export type AiVerdict = "compliant" | "violate" | "need-human-checking";

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
