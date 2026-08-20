import type { AiReview, AiVerdict } from "./types";

// Shared verdict mapping + tolerant JSON extraction, so every adapter returns
// the same shape regardless of the provider's response quirks.

function mapVerdict(raw: string): AiVerdict {
  if (raw === "pass") return "Passed";
  if (raw === "fail") return "Failed";
  return "CannotTell";
}

interface RawVerdict {
  sc?: unknown;
  verdict?: unknown;
  confidence?: unknown;
  reasoning?: unknown;
}

// Extracts `{ verdicts: [...] }` from a model response. Tolerates: the content
// already being a JSON string, the content being a parsed object, or prose
// wrapping a JSON object/array. Returns null when nothing usable is found.
export function parseVerdicts(content: unknown): AiReview[] | null {
  if (content == null) return null;

  let obj: unknown = content;
  if (typeof content === "string") {
    try {
      obj = JSON.parse(content);
    } catch {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          obj = JSON.parse(content.slice(start, end + 1));
        } catch {
          return null;
        }
      } else {
        const a = content.indexOf("[");
        const b = content.lastIndexOf("]");
        if (a >= 0 && b > a) {
          try {
            obj = { verdicts: JSON.parse(content.slice(a, b + 1)) };
          } catch {
            return null;
          }
        } else {
          return null;
        }
      }
    }
  }

  const candidate = obj as { verdicts?: RawVerdict[] };
  if (!Array.isArray(candidate?.verdicts)) return null;

  const out: AiReview[] = [];
  for (const v of candidate.verdicts) {
    if (typeof v?.sc !== "string") continue;
    out.push({
      sc: v.sc,
      verdict: typeof v.verdict === "string" ? mapVerdict(v.verdict) : "CannotTell",
      confidence: typeof v.confidence === "number" ? v.confidence : 0,
      reasoning: typeof v.reasoning === "string" ? v.reasoning : "",
      evidenceId: null,
    });
  }
  return out.length > 0 ? out : null;
}
