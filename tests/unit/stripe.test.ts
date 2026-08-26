import { describe, expect, it, vi } from "vitest";
import { createCheckoutSession, createStripe } from "@/server/stripe";
import type Stripe from "stripe";

function mockStripe(clientSecret: string | null): Stripe {
  return {
    checkout: {
      sessions: {
        create: vi.fn(async () => ({ client_secret: clientSecret })),
      },
    },
  } as unknown as Stripe;
}

describe("StripeService", () => {
  it("creates a checkout session and returns the client secret (AC-10)", async () => {
    const stripe = mockStripe("cs_test_123");
    const result = await createCheckoutSession(10, stripe);
    expect(result).toEqual({ clientSecret: "cs_test_123" });
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 1000 }),
          }),
        ],
      }),
    );
  });

  it("throws when Stripe returns no client secret (AC-E3)", async () => {
    const stripe = mockStripe(null);
    await expect(createCheckoutSession(10, stripe)).rejects.toThrow(/did not return/);
  });

  it("throws when the secret key is missing", () => {
    expect(() => createStripe("")).toThrow(/STRIPE_SECRET_KEY/);
  });
});
