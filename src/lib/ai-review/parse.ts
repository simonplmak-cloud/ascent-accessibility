import type { AiReview, AiVerdict } from "./types";

// Shared verdict mapping + tolerant extraction. Vision/audio models are not
// deterministic JSON emitters: they may fence the JSON, append a summary or a
// second verdicts array, pad with whitespace, or truncate mid-verdict. So we
// (1) strip fences, (2) try a whole-object JSON.parse first (which handles
// nested braces in `reasoning`), and (3) fall back to per-object regex
// extraction — a malformed tail only drops that one verdict, never the batch.

function mapVerdict(raw: string): AiVerdict {
  const v = raw.trim().toLowerCase();
  if (v === "pass" || v === "passed") return "Passed";
  if (v === "fail" || v === "failed") return "Failed";
  return "NotTested";
}

// Strip a leading ```json fence and a trailing ``` fence only (anchored), so a
// literal backtick sequence inside `reasoning` is never corrupted.
function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/g, "");
}

interface RawVerdict {
  sc?: unknown;
  verdict?: unknown;
  confidence?: unknown;
  reasoning?: unknown;
}

function coerce(review: RawVerdict): AiReview | null {
  if (typeof review.sc !== "string" || !review.sc) return null;
  if (typeof review.verdict !== "string" || !review.verdict) return null;
  const confNum =
    typeof review.confidence === "number"
      ? review.confidence
      : typeof review.confidence === "string"
        ? Number.parseFloat(review.confidence)
        : Number.NaN;
  return {
    sc: review.sc,
    verdict: mapVerdict(review.verdict),
    confidence: Number.isFinite(confNum) ? confNum : 0,
    reasoning: typeof review.reasoning === "string" ? review.reasoning : "",
    evidenceId: null,
  };
}

export function parseVerdicts(content: unknown): AiReview[] | null {
  if (content == null) return null;
  const text = stripFences(typeof content === "string" ? content : JSON.stringify(content));

  const out: AiReview[] = [];
  const seen = new Set<string>();

  const push = (candidate: RawVerdict) => {
    const review = coerce(candidate);
    if (!review || seen.has(review.sc)) return;
    seen.add(review.sc);
    out.push(review);
  };

  // 1) Whole-object parse — handles the {"verdicts":[...]} wrapper, a bare
  //    {"sc":...} object, or an array of verdicts, including braces in reasoning.
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) {
      for (const item of parsed) if (item && typeof item === "object") push(item as RawVerdict);
    } else if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const verdicts = obj.verdicts;
      if (Array.isArray(verdicts)) {
        for (const item of verdicts) if (item && typeof item === "object") push(item as RawVerdict);
      } else if (obj.sc != null) {
        push(obj as RawVerdict);
      }
    }
  } catch {
    // Not valid JSON (prose-wrapped, truncated, or two concatenated objects) —
    // fall through to regex extraction.
  }

  if (out.length === 0) {
    // 2) Regex fallback for flat {"sc":...} objects (no nested braces).
    const objRe = /\{\s*"sc"\s*:[^{}]*?\}/g;
    let m: RegExpExecArray | null;
    while ((m = objRe.exec(text)) !== null) {
      const obj = m[0];
      const sc = /"sc"\s*:\s*"([^"]+)"/.exec(obj)?.[1];
      const verdict = /"verdict"\s*:\s*"([^"]+)"/.exec(obj)?.[1];
      const confidence = /"confidence"\s*:\s*(0(?:\.\d+)?|1(?:\.0+)?)/.exec(obj)?.[1];
      const reasoning = /"reasoning"\s*:\s*"([^"]*)"/.exec(obj)?.[1];
      if (!sc || !verdict || seen.has(sc)) continue;
      seen.add(sc);
      out.push({
        sc,
        verdict: mapVerdict(verdict),
        confidence: confidence !== undefined ? parseFloat(confidence) : 0,
        reasoning: reasoning ?? "",
        evidenceId: null,
      });
    }
  }

  return out.length > 0 ? out : null;
}
