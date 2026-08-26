// Dependency-free page-language detection. Best-effort transparency — never a
// WCAG verdict. Script classification by Unicode range, plus a Traditional vs
// Simplified disambiguation that prefers the declared `lang` attribute and falls
// back to a marker-character heuristic.

export type ScriptTag = "en" | "zh" | "ja" | "ko" | "ar" | "ru" | "th" | "hi";

export type DetectedLanguage = "en" | "zh" | "zh-Hant" | "zh-Hans" | "ja" | "ko" | "ar" | "ru" | "th" | "hi";

const SCRIPT_ORDER: ScriptTag[] = ["en", "zh", "ja", "ko", "ar", "ru", "th", "hi"];

// A script only "counts" once it exceeds this fraction of the sampled text, so a
// stray Latin word inside a Chinese page doesn't produce `["en","zh"]`.
export const DEFAULT_SCRIPT_THRESHOLD = 0.05;

function scriptOf(cp: number): ScriptTag | null {
  if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a) || (cp >= 0xc0 && cp <= 0xff)) return "en";
  if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) return "zh";
  if (cp >= 0x3040 && cp <= 0x30ff) return "ja";
  if (cp >= 0xac00 && cp <= 0xd7af) return "ko";
  if (cp >= 0x0600 && cp <= 0x06ff) return "ar";
  if (cp >= 0x0400 && cp <= 0x04ff) return "ru";
  if (cp >= 0x0e00 && cp <= 0x0e7f) return "th";
  if (cp >= 0x0900 && cp <= 0x097f) return "hi";
  return null;
}

// Scripts present above the threshold, in a stable order.
export function detectScripts(text: string, threshold = DEFAULT_SCRIPT_THRESHOLD): ScriptTag[] {
  const counts = new Map<ScriptTag, number>();
  let total = 0;
  for (const ch of text) {
    const s = scriptOf(ch.codePointAt(0) ?? 0);
    if (s) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
      total += 1;
    }
  }
  if (total === 0) return [];
  const above = new Set<ScriptTag>();
  for (const tag of SCRIPT_ORDER) {
    if ((counts.get(tag) ?? 0) / total >= threshold) above.add(tag);
  }
  // Kana (ja) and Hangul (ko) mark the CJK block as kanji/hanja, not Chinese —
  // Japanese/Korean text routinely contains CJK-range characters.
  if (above.has("ja") || above.has("ko")) above.delete("zh");
  return SCRIPT_ORDER.filter((tag) => above.has(tag));
}

// Marker characters that distinguish Traditional from Simplified. Best-effort:
// short/technical pages may yield neither side → "zh" (ambiguous).
const HANT_MARKERS = new Set("這個們來時為說學東車長門問間開關對應變邊裡後從沒點覺讀語書買錢銀鐵難題頭體會過條動務無與國團園圖讓還");
const HANS_MARKERS = new Set("这个们来时为说学东车长门问间开关对应变边里后从没点觉读语书买钱银铁难题头体会过条动务无与国团园图让还");

export function classifyZh(text: string): "zh-Hant" | "zh-Hans" | "zh" {
  let hant = 0;
  let hans = 0;
  for (const ch of text) {
    if (HANT_MARKERS.has(ch)) hant += 1;
    else if (HANS_MARKERS.has(ch)) hans += 1;
  }
  if (hant > 0 && hant >= hans * 2) return "zh-Hant";
  if (hans > 0 && hans >= hant * 2) return "zh-Hans";
  return "zh";
}

function canonicalDeclared(raw: string): DetectedLanguage | null {
  const lang = raw.trim().toLowerCase();
  if (lang === "en" || lang.startsWith("en-")) return "en";
  if (lang === "zh-hant" || lang === "zh-tw" || lang === "zh-hk" || lang === "zh-mo") return "zh-Hant";
  if (lang === "zh-hans" || lang === "zh-cn" || lang === "zh-sg") return "zh-Hans";
  if (lang === "zh") return "zh";
  if (lang === "ja" || lang.startsWith("ja-")) return "ja";
  if (lang === "ko" || lang.startsWith("ko-")) return "ko";
  if (lang === "ar" || lang.startsWith("ar-")) return "ar";
  if (lang === "ru" || lang.startsWith("ru-")) return "ru";
  if (lang === "th" || lang.startsWith("th-")) return "th";
  if (lang === "hi" || lang.startsWith("hi-")) return "hi";
  return null;
}

// Merge the declared `lang` attribute with script detection. The declared lang
// disambiguates Hant/Hans; script detection fills the rest. Mixed-language pages
// yield multiple tags. Falls back to the declared lang when no text is sampled.
export function resolveDetectedLanguages(declaredLang: string | null | undefined, text: string): DetectedLanguage[] {
  const scripts = detectScripts(text);
  const declared = declaredLang ? canonicalDeclared(declaredLang) : null;

  if (scripts.length === 0) {
    return declared ? [declared] : [];
  }

  const out: DetectedLanguage[] = [];
  for (const script of scripts) {
    if (script === "zh") {
      if (declared === "zh-Hant" || declared === "zh-Hans") out.push(declared);
      else out.push(classifyZh(text));
    } else {
      out.push(script);
    }
  }
  return [...new Set(out)];
}

// Parse a persisted `detectedLanguages` JSON string back into a string array.
export function parseDetectedLanguages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
