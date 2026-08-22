import { describe, expect, it } from "vitest";
import { WCAG_SCS, principleName, guidelineName, scTitle } from "@/lib/standards/wcag-sc";
import { STANDARD_STRINGS } from "@/lib/standards/standards-locales";
import { outcomeLabel, impactLabel, verdictLabel } from "@/lib/labels";

describe("standards-locales", () => {
  it("matches the W3C-authorized zh-Hans SC titles (golden sample)", () => {
    const golden: Record<string, string> = {
      "1.1.1": "非文本内容",
      "1.2.2": "字幕（预录）",
      "1.3.1": "信息和关系",
      "1.4.3": "对比度（最小）",
      "2.1.1": "键盘",
      "2.4.4": "链接目的（在上下文里）",
      "3.3.1": "错误标识",
      "4.1.2": "名称，角色，值",
      "4.1.1": "解析",
    };
    for (const [num, title] of Object.entries(golden)) {
      expect(scTitle(num, "zh-Hans")).toBe(title);
    }
  });

  it("covers every SC in both zh locales (86 SCs)", () => {
    for (const locale of ["zh-Hant", "zh-Hans"]) {
      for (const sc of WCAG_SCS) {
        expect(STANDARD_STRINGS[locale]?.sc[sc.num], `${locale} missing ${sc.num}`).toBeTruthy();
      }
    }
  });

  it("localizes guideline + principle names", () => {
    expect(guidelineName("1.1", "zh-Hans")).toBe("替代文本");
    expect(guidelineName("2.4", "zh-Hans")).toBe("可导航性");
    expect(principleName(1, "zh-Hans")).toBe("可感知性");
    expect(principleName(4, "zh-Hans")).toBe("鲁棒性");
    expect(principleName(4, "zh-Hant")).toBe("穩健性");
  });

  it("falls back to English for an unknown locale", () => {
    expect(scTitle("1.1.1", "de")).toBe("Non-text Content");
    expect(principleName(1, "de")).toBe("Perceivable");
    expect(outcomeLabel("conforms", "de")).toBe("Conforms");
  });
});

describe("labels", () => {
  it("localizes conformance outcome labels", () => {
    expect(outcomeLabel("conforms", "zh-Hans")).toBe("符合");
    expect(outcomeLabel("does-not-conform", "zh-Hant")).toBe("不符合");
    expect(outcomeLabel(null)).toBe("—");
  });

  it("localizes impact and verdict labels", () => {
    expect(impactLabel("critical", "zh-Hans")).toBe("严重");
    expect(impactLabel("minor", "zh-Hant")).toBe("輕微");
    expect(verdictLabel("CannotTell", "zh-Hans")).toBe("无法判断");
    expect(verdictLabel("Passed", "zh-Hant")).toBe("通過");
    expect(impactLabel("critical")).toBe("critical");
  });
});
