import { describe, expect, it } from "vitest";
import { hashToken, mintToken } from "@/lib/auth/identity";

describe("identity tokens", () => {
  it("hashes deterministically and uniquely", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });

  it("mints unique, 64-char tokens", () => {
    const a = mintToken();
    const b = mintToken();
    expect(a).not.toBe(b);
    expect(a).toHaveLength(64);
  });
});
