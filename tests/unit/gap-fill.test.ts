import { describe, expect, it } from "vitest";
import { gapFillRules } from "@/lib/engine/rules/gap-fill";
import { instructionsOf } from "@/lib/standards/nature";

function check(id: string) {
  const rule = gapFillRules.find((r) => r.id === id);
  expect(rule, `rule ${id} missing`).toBeTruthy();
  return rule!.checks[0]!.evaluate;
}

describe("gap-fill rules", () => {
  it("ships 8 rules with the right SC mapping", () => {
    expect(gapFillRules).toHaveLength(8);
    const ids = gapFillRules.map((r) => r.id).sort();
    expect(ids).toEqual(
      [
        "contrast-enhanced",
        "help",
        "location",
        "multiple-ways",
        "no-timing",
        "redundant-entry",
        "section-headings",
        "target-size-enhanced",
      ].sort(),
    );
  });

  it("no longer maps the 8 SCs to 'gap'", () => {
    for (const sc of ["1.4.6", "2.5.5", "2.4.5", "2.4.8", "2.4.10", "3.3.5", "3.3.7", "2.2.3"]) {
      expect(instructionsOf(sc)[0]?.method?.ruleId, `${sc} still gap`).not.toBe("gap");
    }
  });

  it("contrast-enhanced fails below 7:1 (AAA)", () => {
    const ev = check("contrast-enhanced");
    const low = ev({ text: "x", fg: [128, 128, 128, 1], bg: [255, 255, 255, 1], fontSize: 16, fontWeight: 400 });
    expect(low.result).toBe("fail");
    const high = ev({ text: "x", fg: [0, 0, 0, 1], bg: [255, 255, 255, 1], fontSize: 16, fontWeight: 400 });
    expect(high.result).toBe("pass");
  });

  it("target-size-enhanced fails below 44x44 (AAA)", () => {
    const ev = check("target-size-enhanced");
    expect(ev({ width: 20, height: 20, inline: false }).result).toBe("fail");
    expect(ev({ width: 48, height: 48, inline: false }).result).toBe("pass");
    expect(ev({ width: 0, height: 0, inline: false }).result).toBe("pass");
  });

  it("presence-based rules pass on presence, incomplete on absence (never fail)", () => {
    expect(check("multiple-ways")({ hasNav: true, hasSearch: true, hasSitemap: false, hasBreadcrumb: false }).result).toBe("pass");
    expect(check("multiple-ways")({ hasNav: true, hasSearch: false, hasSitemap: false, hasBreadcrumb: false }).result).toBe("incomplete");
    expect(check("location")({ hasBreadcrumb: true, hasCurrent: false }).result).toBe("pass");
    expect(check("location")({ hasBreadcrumb: false, hasCurrent: false }).result).toBe("incomplete");
    expect(check("help")({ hasHelpLink: true, hasDescribedBy: false }).result).toBe("pass");
    expect(check("help")({ hasHelpLink: false, hasDescribedBy: false }).result).toBe("incomplete");
    expect(check("no-timing")({ hasMetaRefresh: false }).result).toBe("pass");
    expect(check("no-timing")({ hasMetaRefresh: true }).result).toBe("incomplete");
  });

  it("redundant-entry passes on autocomplete or no inputs", () => {
    const ev = check("redundant-entry");
    expect(ev({ textInputCount: 0, autocompleteCount: 0 }).result).toBe("pass");
    expect(ev({ textInputCount: 3, autocompleteCount: 1 }).result).toBe("pass");
    expect(ev({ textInputCount: 3, autocompleteCount: 0 }).result).toBe("incomplete");
  });
});

