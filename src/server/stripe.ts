import Stripe from "stripe";

// Graceful client — returns null when STRIPE_SECRET_KEY is absent so callers can
// degrade instead of throwing.
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Throwing client for flows that must fail loudly (and for DI in tests).
export function createStripe(key = process.env.STRIPE_SECRET_KEY ?? ""): Stripe {
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

// Donation checkout, billed in USD. `recurring` creates a monthly (subscription)
// donation; otherwise a one-time payment.
export async function createCheckoutSession(
  amountUsd: number,
  stripe: Stripe = createStripe(),
  recurring = false,
): Promise<{ url: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: recurring ? "Monthly donation" : "Donation" },
          unit_amount: Math.round(amountUsd * 100),
          ...(recurring ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/donate?success=1`,
    cancel_url: `${siteUrl}/donate`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  return { url: session.url };
}
