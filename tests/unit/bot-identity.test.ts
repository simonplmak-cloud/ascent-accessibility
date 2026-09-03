import { describe, expect, it } from "vitest";
import { BOT_USER_AGENT, VERIFY_META_NAME, verifyTokenFor } from "@/lib/site/bot-identity";

describe("bot identity", () => {
  it("has a stable, self-documenting User-Agent", () => {
    expect(BOT_USER_AGENT).toMatch(/AscentAccessibilityBot\/\d+\.\d+/);
    expect(BOT_USER_AGENT).toContain("/bot");
  });

  it("exposes the verify meta tag name", () => {
    expect(VERIFY_META_NAME).toBe("ascent-verify");
  });

  it("derives a deterministic per-owner token", () => {
    expect(verifyTokenFor("user:abc")).toBe(verifyTokenFor("user:abc"));
    expect(verifyTokenFor("user:abc")).not.toBe(verifyTokenFor("user:def"));
  });

  it("derives a secret-dependent token when SCAN_VERIFY_SECRET is set", () => {
    const prev = process.env.SCAN_VERIFY_SECRET;
    process.env.SCAN_VERIFY_SECRET = "test-secret";
    const a = verifyTokenFor("user:abc");
    process.env.SCAN_VERIFY_SECRET = "other-secret";
    const b = verifyTokenFor("user:abc");
    expect(a).not.toBe(b);
    if (prev === undefined) delete process.env.SCAN_VERIFY_SECRET;
    else process.env.SCAN_VERIFY_SECRET = prev;
  });
});
