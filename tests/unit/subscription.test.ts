import { describe, expect, it } from "vitest";
import { isWholeSiteAllowed } from "@/lib/entitlement";

describe("isWholeSiteAllowed", () => {
  it("allows an authenticated subscriber (AC-4)", () => {
    expect(isWholeSiteAllowed({ userId: "u1", subscribed: true })).toEqual({ ok: true });
  });

  it("returns UNAUTHORIZED for an anonymous user (AC-2)", () => {
    expect(isWholeSiteAllowed({ userId: null, subscribed: false })).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
  });

  it("returns PAYMENT_REQUIRED for an unsubscribed user (AC-3)", () => {
    expect(isWholeSiteAllowed({ userId: "u1", subscribed: false })).toEqual({
      ok: false,
      code: "PAYMENT_REQUIRED",
    });
  });
});
