import Stripe from "stripe";

export function createStripe(key = process.env.STRIPE_SECRET_KEY ?? ""): Stripe {
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function createCheckoutSession(
  amountUsd: number,
  stripe: Stripe = createStripe(),
): Promise<{ url: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Donation" },
          unit_amount: Math.round(amountUsd * 100),
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
