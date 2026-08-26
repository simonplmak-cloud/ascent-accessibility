import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site/site-url";

// Throwing client for flows that must fail loudly (and for DI in tests).
export function createStripe(key = process.env.STRIPE_SECRET_KEY ?? ""): Stripe {
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

// Donation checkout, billed in USD. `recurring` creates a monthly (subscription)
// donation; otherwise a one-time payment. Embedded Checkout renders on-site.
export async function createCheckoutSession(
  amountUsd: number,
  stripe: Stripe = createStripe(),
  recurring = false,
): Promise<{ clientSecret: string }> {
  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    ui_mode: "elements",
    allow_promotion_codes: true,
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
    return_url: `${siteUrl}/donate?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }
  return { clientSecret: session.client_secret };
}
