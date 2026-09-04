import { describe, expect, it } from "vitest";
import { ALL_RULES } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";

// The engine serializes every rule's extract/check via `.toString()` and runs
// them in the browser's isolated realm. A rule that closes over a module-level
// variable would serialize fine but throw `ReferenceError` at runtime in-page.
//
// This guard asserts the serialized source is a self-contained IIFE that
// evaluates with only a `window` stub in scope. (Closure capture is caught at
// run time by the happy-dom harness in rules.test.ts — the "no errors" test.)
describe("engine self-contained invariant", () => {
  it("serialized source evaluates in an isolated scope with only a window stub", () => {
    const source = buildEngineSource(ALL_RULES);
    const windowStub: Record<string, unknown> = {};
    const factory = new Function("window", source);
    expect(() => factory(windowStub)).not.toThrow();
    expect(windowStub.__apfEngine).toBeTruthy();
  });
});
