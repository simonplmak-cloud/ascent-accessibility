import type { AiReview, AiVerdict } from "./types";

// Shared verdict mapping + tolerant extraction. Vision/audio models are not
// deterministic JSON emitters: they may fence the JSON, append a summary or a
// second verdicts array, pad with whitespace, or truncate mid-verdict. So we
// extract each verdict object individually (regex) and dedupe by SC — a
// malformed tail only drops that one verdict, never the whole batch.

function mapVerdict(raw: string): AiVerdict {
  const v = raw.trim().toLowerCase();
  if (v === "pass" || v === "passed") return "Passed";
  if (v === "fail" || v === "failed") return "Failed";
  return "CannotTell";
}

export function parseVerdicts(content: unknown): AiReview[] | null {
  if (content == null) return null;
  const text = typeof content === "string" ? content : JSON.stringify(content);

  const out: AiReview[] = [];
  const seen = new Set<string>();
  // Each verdict object is flat and begins with "sc".
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
  return out.length > 0 ? out : null;
}
