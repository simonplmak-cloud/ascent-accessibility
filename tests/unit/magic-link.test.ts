import { describe, expect, it } from "vitest";
import { hashToken, mintMagicLinkToken } from "@/lib/auth/magic-link";

describe("magic-link tokens", () => {
  it("hashes deterministically and uniquely", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });

  it("mints unique, 64-char tokens", () => {
    const a = mintMagicLinkToken();
    const b = mintMagicLinkToken();
    expect(a).not.toBe(b);
    expect(a).toHaveLength(64);
  });
});
