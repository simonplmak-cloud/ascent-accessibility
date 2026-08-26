import { describe, expect, it } from "vitest";
import { createConfigStore } from "@/lib/ai-review/config-store";
import { getDefaultAiConfig } from "@/lib/ai-review/sc-config";

describe("createConfigStore", () => {
  it("returns the code default when the DB has no row", async () => {
    const store = createConfigStore(async () => []);
    const config = await store.get("1.3.3");
    expect(config).toEqual(getDefaultAiConfig("1.3.3"));
  });

  it("merges a DB override over the code default", async () => {
    const store = createConfigStore(async () => [
      { ...getDefaultAiConfig("1.3.3")!, description: "override description", ruleId: "override-rule" },
    ]);
    const config = await store.get("1.3.3");
    expect(config.description).toBe("override description");
    expect(config.ruleId).toBe("override-rule");
    expect(config.instruction).toBe(getDefaultAiConfig("1.3.3")!.instruction);
  });

  it("falls back to the code default when the DB errors (AC-E1)", async () => {
    const store = createConfigStore(async () => {
      throw new Error("db down");
    });
    expect(await store.get("1.3.3")).toEqual(getDefaultAiConfig("1.3.3"));
  });

  it("returns a synthesized conservative config for an unknown SC", async () => {
    const store = createConfigStore(async () => []);
    const config = await store.get("9.9.9");
    expect(config.judgeable).toBe(false);
    expect(config.ruleId).toBe("ai-9.9.9");
    expect(config.enabled).toBe(true);
  });

  it("caches results within TTL", async () => {
    let calls = 0;
    const store = createConfigStore(async () => {
      calls += 1;
      return [];
    });
    await store.get("1.3.3");
    await store.get("1.3.3");
    expect(calls).toBe(1);
  });

  it("keeps the last good cache when a later refresh errors", async () => {
    let fail = false;
    const store = createConfigStore(async () => {
      if (fail) throw new Error("down");
      fail = true;
      return [{ ...getDefaultAiConfig("1.3.3")!, description: "cached" }];
    }, 0);
    expect((await store.get("1.3.3")).description).toBe("cached");
    expect((await store.get("1.3.3")).description).toBe("cached");
  });
});
