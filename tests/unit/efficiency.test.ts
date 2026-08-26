import { describe, expect, it } from "vitest";
import {
  findCollisions,
  GLOBAL_SHORTCUTS,
  normalizeCombo,
} from "@/lib/efficiency/keyboard";
import { rankCommands } from "@/lib/efficiency/palette";
import { decodeViewState, encodeViewState } from "@/lib/efficiency/saved-views";

describe("keyboard", () => {
  it("normalizes combos (case + whitespace)", () => {
    expect(normalizeCombo("Mod+K")).toBe("mod+k");
    expect(normalizeCombo("  g  s ")).toBe("gs");
    expect(normalizeCombo("Shift+Enter")).toBe("shift+enter");
  });

  it("finds colliding shortcuts", () => {
    const collisions = findCollisions([
      { keys: "mod+k", action: "palette" },
      { keys: "MOD+K", action: "another" },
      { keys: "j", action: "next" },
    ]);
    expect(collisions).toEqual([{ keys: "mod+k", actions: ["palette", "another"] }]);
  });

  it("ships a collision-free global map", () => {
    expect(findCollisions(GLOBAL_SHORTCUTS)).toEqual([]);
  });
});

describe("palette", () => {
  const commands = [
    { id: "scan", label: "New scan" },
    { id: "review", label: "Review queue" },
    { id: "training", label: "Training paths", keywords: "learn courses" },
    { id: "report", label: "Open report" },
  ];

  it("returns all commands for an empty query", () => {
    expect(rankCommands("", commands).map((c) => c.id)).toEqual([
      "scan",
      "review",
      "training",
      "report",
    ]);
  });

  it("ranks label-prefix matches first", () => {
    expect(rankCommands("rev", commands).map((c) => c.id)).toEqual(["review"]);
    expect(rankCommands("s", commands)[0]?.id).toBe("scan");
  });

  it("matches on keywords as a fallback", () => {
    expect(rankCommands("course", commands).map((c) => c.id)).toEqual(["training"]);
  });

  it("returns nothing for a non-matching query", () => {
    expect(rankCommands("zzz", commands)).toEqual([]);
  });
});

describe("saved-views", () => {
  it("round-trips view state through URL params", () => {
    const encoded = encodeViewState({ status: "completed", sort: "createdAt", dir: "desc", q: "gov" });
    expect(encoded).toContain("status=completed");
    expect(decodeViewState(encoded)).toEqual({
      status: "completed",
      sort: "createdAt",
      dir: "desc",
      q: "gov",
    });
  });

  it("omits empty values and coerces dir", () => {
    expect(encodeViewState({ status: "", dir: "asc" })).toBe("dir=asc");
    expect(decodeViewState("dir=bogus")).toEqual({ dir: "desc" });
    expect(decodeViewState("")).toEqual({});
  });
});
