import { describe, expect, it, vi } from "vitest";
import { createCheckoutSession, createStripe } from "@/server/stripe";
import type Stripe from "stripe";

function mockStripe(url: string | null): Stripe {
  return {
    checkout: {
      sessions: {
        create: vi.fn(async () => ({ url })),
      },
    },
  } as unknown as Stripe;
}

describe("StripeService", () => {
  it("creates a checkout session and returns the URL (AC-10)", async () => {
    const stripe = mockStripe("https://checkout.stripe.com/c/pay/abc");
    const result = await createCheckoutSession(10, stripe);
    expect(result).toEqual({ url: "https://checkout.stripe.com/c/pay/abc" });
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

  it("throws when Stripe returns no URL (AC-E3)", async () => {
    const stripe = mockStripe(null);
    await expect(createCheckoutSession(10, stripe)).rejects.toThrow(/did not return/);
  });

  it("throws when the secret key is missing", () => {
    expect(() => createStripe("")).toThrow(/STRIPE_SECRET_KEY/);
  });
});
