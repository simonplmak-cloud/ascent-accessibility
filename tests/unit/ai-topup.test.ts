import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { handleAiTopup } from "@/server/stripe-webhook";

type Session = Stripe.Checkout.Session;

function session(overrides: Record<string, unknown> = {}): Session {
  return {
    id: "cs_test_123",
    client_reference_id: "user:abc",
    amount_total: 1000,
    metadata: { kind: "ai-topup", userId: "user:abc" },
    ...overrides,
  } as unknown as Session;
}

describe("handleAiTopup", () => {
  it("credits a new ai-topup session and returns the account id", async () => {
    const credit = vi.fn(async () => true);
    const id = await handleAiTopup(session(), { credit });
    expect(id).toBe("user:abc");
    expect(credit).toHaveBeenCalledWith("user:abc", 1000, "cs_test_123");
  });

  it("ignores non-ai-topup sessions", async () => {
    const credit = vi.fn(async () => true);
    const id = await handleAiTopup(session({ metadata: { kind: "donation" } }), { credit });
    expect(id).toBeNull();
    expect(credit).not.toHaveBeenCalled();
  });

  it("returns null on a replayed (already credited) session", async () => {
    const credit = vi.fn(async () => false);
    const id = await handleAiTopup(session(), { credit });
    expect(id).toBeNull();
  });

  it("ignores sessions without an account id or amount", async () => {
    const credit = vi.fn(async () => true);
    expect(
      await handleAiTopup(session({ client_reference_id: null, metadata: {} }), { credit }),
    ).toBeNull();
    expect(await handleAiTopup(session({ amount_total: 0 }), { credit })).toBeNull();
    expect(credit).not.toHaveBeenCalled();
  });
});
