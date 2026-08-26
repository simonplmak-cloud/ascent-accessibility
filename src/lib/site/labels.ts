// Locale-aware display labels for enum-like values that surface in the report
// and auditor (conformance outcome, finding impact, SC verdict). These are
// Ascent-authored labels (not W3C text), translated in-house.

type OutcomeKey = "conforms" | "does-not-conform" | "undetermined";

const OUTCOME: Record<string, Record<OutcomeKey, string>> = {
  "zh-Hant": { conforms: "符合", "does-not-conform": "不符合", undetermined: "尚未評估" },
  "zh-Hans": { conforms: "符合", "does-not-conform": "不符合", undetermined: "尚未评估" },
};

const IMPACT: Record<string, Record<string, string>> = {
  "zh-Hant": { critical: "嚴重", serious: "重大", moderate: "中等", minor: "輕微" },
  "zh-Hans": { critical: "严重", serious: "重大", moderate: "中等", minor: "轻微" },
};

const VERDICT: Record<string, Record<string, string>> = {
  "zh-Hant": {
    Passed: "通過",
    Failed: "未通過",
    CannotTell: "無法判斷",
    NotPresent: "不存在",
    Unresolved: "未解決",
  },
  "zh-Hans": {
    Passed: "通过",
    Failed: "未通过",
    CannotTell: "无法判断",
    NotPresent: "不存在",
    Unresolved: "未解决",
  },
};

export function outcomeLabel(
  outcome: string | null | undefined,
  locale?: string,
): string {
  if (outcome === "conforms") return OUTCOME[locale ?? ""]?.conforms ?? "Conforms";
  if (outcome === "does-not-conform") {
    return OUTCOME[locale ?? ""]?.["does-not-conform"] ?? "Does not conform";
  }
  if (outcome === "undetermined") return OUTCOME[locale ?? ""]?.undetermined ?? "Not yet evaluated";
  return "—";
}

export function impactLabel(impact: string, locale?: string): string {
  return IMPACT[locale ?? ""]?.[impact] ?? impact;
}

export function verdictLabel(verdict: string, locale?: string): string {
  return VERDICT[locale ?? ""]?.[verdict] ?? verdict;
}
