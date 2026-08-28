import { describe, expect, it } from "vitest";
import {
  issueMagicLinkToken,
  normalizeEmail,
  verifyMagicLinkToken,
} from "@/lib/auth/identity";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Simon@Example.COM  ")).toBe("simon@example.com");
    expect(normalizeEmail("A@B.com")).toBe("a@b.com");
    expect(normalizeEmail("a@b.com")).toBe("a@b.com");
  });
});

describe("magic-link token", () => {
  it("round-trips the email", () => {
    const token = issueMagicLinkToken("Simon@Example.COM");
    expect(verifyMagicLinkToken(token)?.email).toBe("simon@example.com");
  });

  it("rejects a tampered signature", () => {
    const token = issueMagicLinkToken("simon@example.com");
    const [payload] = token.split(".");
    expect(verifyMagicLinkToken(`${payload}.AAAA`)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifyMagicLinkToken("garbage")).toBeNull();
    expect(verifyMagicLinkToken("a.b.c")).toBeNull();
  });
});
