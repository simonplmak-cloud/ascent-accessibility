import { describe, expect, it } from "vitest";
import {
  balanceToLimitUsd,
  topupTiersUsd,
  DEFAULT_TOPUP_TIERS_USD,
} from "@/lib/ai-review/balance";

describe("balanceToLimitUsd", () => {
  it("converts cents to a USD limit (double)", () => {
    expect(balanceToLimitUsd(500)).toBe(5);
    expect(balanceToLimitUsd(1234)).toBe(12.34);
    expect(balanceToLimitUsd(0)).toBe(0);
    expect(balanceToLimitUsd(99)).toBe(0.99);
  });
});

describe("topupTiersUsd", () => {
  it("parses a comma-separated env value", () => {
    expect(topupTiersUsd("3,7,15")).toEqual([3, 7, 15]);
  });
  it("ignores non-positive/NaN entries", () => {
    expect(topupTiersUsd("5,0,-2,abc,10")).toEqual([5, 10]);
  });
  it("falls back to defaults when empty/invalid", () => {
    expect(topupTiersUsd("")).toEqual([...DEFAULT_TOPUP_TIERS_USD]);
    expect(topupTiersUsd(undefined)).toEqual([...DEFAULT_TOPUP_TIERS_USD]);
    expect(topupTiersUsd("x,y")).toEqual([...DEFAULT_TOPUP_TIERS_USD]);
  });
});
