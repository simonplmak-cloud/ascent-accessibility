import { z } from "zod";
import type { AiReview, AiVerdict, VisionModel } from "./types";

// The model's raw vocabulary stays pass/fail/needs-review (its JSON contract);
// we map to the pipeline's verdicts at the boundary.
const RawVerdictEnum = z.enum(["pass", "fail", "needs-review"]);
type RawVerdict = z.infer<typeof RawVerdictEnum>;

export const AiReviewSchema = z.object({
  verdicts: z.array(
    z.object({
      sc: z.string(),
      verdict: RawVerdictEnum,
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    }),
  ),
});

function mapVerdict(v: RawVerdict): AiVerdict {
  return v === "pass" ? "compliant" : v === "fail" ? "violate" : "need-human-checking";
}

export class ImageTooLargeError extends Error {
  constructor() {
    super("AI screenshot exceeds the 6MB DashScope payload limit");
    this.name = "ImageTooLargeError";
  }
}

const MAX_BASE64_BYTES = 6 * 1024 * 1024;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sc: { type: "string" },
          verdict: { type: "string", enum: ["pass", "fail", "needs-review"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          reasoning: { type: "string" },
        },
        required: ["sc", "verdict", "confidence", "reasoning"],
        additionalProperties: false,
      },
    },
  },
  required: ["verdicts"],
  additionalProperties: false,
} as const;

export interface QwenOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  fetchFn?: typeof fetch;
}

export class QwenVisionClient implements VisionModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: QwenOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.QWEN_API_KEY ?? "";
    this.baseUrl = (
      opts.baseUrl ??
      process.env.QWEN_BASE_URL ??
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    ).replace(/\/$/, "");
    this.model = opts.model ?? process.env.AI_REVIEW_MODEL ?? "qwen3-vl-flash";
    this.fetchFn = opts.fetchFn ?? fetch;
  }

  async review(input: { image: Buffer; prompt: string }): Promise<AiReview[]> {
    const base64 = input.image.toString("base64");
    if (base64.length > MAX_BASE64_BYTES) throw new ImageTooLargeError();

    const res = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              { type: "text", text: input.prompt },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "accessibility_triage", strict: true, schema: RESPONSE_SCHEMA },
        },
      }),
      signal: AbortSignal.timeout(Number(process.env.AI_REVIEW_TIMEOUT_MS ?? 60_000)),
    });

    if (!res.ok) throw new Error(`Qwen HTTP ${res.status}`);

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | unknown } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : JSON.stringify(content ?? "{}");
    const parsed = AiReviewSchema.parse(JSON.parse(text));
    return parsed.verdicts.map((v) => ({
      sc: v.sc,
      verdict: mapVerdict(v.verdict),
      confidence: v.confidence,
      reasoning: v.reasoning,
      evidenceId: null,
    }));
  }
}
