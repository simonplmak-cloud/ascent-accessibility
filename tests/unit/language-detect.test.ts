import { describe, expect, it } from "vitest";
import {
  classifyZh,
  detectScripts,
  resolveDetectedLanguages,
} from "@/lib/standards/language-detect";

const EN = "This is a sample page about accessibility.";
const ZH_HANT = "這個網站是我們開設的，歡迎來訪。";
const ZH_HANS = "这个网站是我们开设的，欢迎来访。";
const JA = "これはアクセシビリティの例です。";
const KO = "이것은 접근성 예시입니다.";

describe("detectScripts", () => {
  it("classifies Latin as en", () => {
    expect(detectScripts(EN)).toEqual(["en"]);
  });

  it("classifies CJK as zh", () => {
    expect(detectScripts(ZH_HANT)).toEqual(["zh"]);
  });

  it("classifies Kana as ja", () => {
    expect(detectScripts(JA)).toEqual(["ja"]);
  });

  it("classifies Hangul as ko", () => {
    expect(detectScripts(KO)).toEqual(["ko"]);
  });

  it("returns multiple tags for a mixed-language page", () => {
    const out = detectScripts(`${EN} ${ZH_HANT}`);
    expect(out).toContain("en");
    expect(out).toContain("zh");
  });

  it("applies the 5% threshold to drop a stray script", () => {
    expect(detectScripts("A".repeat(20) + "你")).toEqual(["en"]);
    expect(detectScripts("A".repeat(5) + "你")).toEqual(["en", "zh"]);
  });

  it("returns an empty list for empty/unsupported text", () => {
    expect(detectScripts("")).toEqual([]);
    expect(detectScripts("12345 !@#$%")).toEqual([]);
  });
});

describe("classifyZh", () => {
  it("prefers Traditional on marker dominance", () => {
    expect(classifyZh(ZH_HANT)).toBe("zh-Hant");
  });

  it("prefers Simplified on marker dominance", () => {
    expect(classifyZh(ZH_HANS)).toBe("zh-Hans");
  });

  it("returns zh when markers are ambiguous/absent", () => {
    expect(classifyZh("中文内容")).toBe("zh");
  });
});

describe("resolveDetectedLanguages", () => {
  it("uses the declared lang to disambiguate zh", () => {
    expect(resolveDetectedLanguages("zh-Hant", "中文內容測試")).toEqual(["zh-Hant"]);
    expect(resolveDetectedLanguages("zh-cn", "中文内容测试")).toEqual(["zh-Hans"]);
  });

  it("falls back to the marker heuristic when no declared lang", () => {
    expect(resolveDetectedLanguages(null, ZH_HANT)).toEqual(["zh-Hant"]);
    expect(resolveDetectedLanguages(undefined, ZH_HANS)).toEqual(["zh-Hans"]);
  });

  it("reports mixed languages as a list", () => {
    const out = resolveDetectedLanguages("zh-Hant", `${EN} ${ZH_HANT}`);
    expect(out).toEqual(["en", "zh-Hant"]);
  });

  it("falls back to the declared lang when no text is sampled", () => {
    expect(resolveDetectedLanguages("ja", "")).toEqual(["ja"]);
    expect(resolveDetectedLanguages(null, "")).toEqual([]);
  });
});
