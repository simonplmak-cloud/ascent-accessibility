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

// Per-session Checkout branding matching the site's dark terminal theme
// (tailwind terminal.* palette). Fonts use Stripe's supported monospace set.
export function checkoutBranding(): Stripe.Checkout.SessionCreateParams.BrandingSettings {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcag-score.ascent.partners";
  return {
    background_color: "#0b0f14",
    button_color: "#3fb950",
    display_name: "Ascent Accessibility",
    font_family: "inconsolata",
    logo: { type: "url", url: `${siteUrl}/images/apf-logo.png` },
  };
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
    submit_type: "donate",
    branding_settings: checkoutBranding(),
    custom_text: {
      submit: { message: "Thank you for supporting Ascent Partners Foundation." },
    },
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
