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
  return {
    background_color: "#0b0f14",
    button_color: "#3fb950",
    display_name: "Ascent Accessibility",
    font_family: "inconsolata",
  };
}

// Donation checkout, billed in USD. `recurring` creates a monthly (subscription)
// donation; otherwise a one-time payment. Embedded Checkout renders on-site.
export async function createCheckoutSession(
  amountUsd: number,
  stripe: Stripe = createStripe(),
  recurring = false,
): Promise<{ clientSecret: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    ui_mode: "embedded_page",
    submit_type: "donate",
    allow_promotion_codes: true,
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
    return_url: `${siteUrl}/donate?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }
  return { clientSecret: session.client_secret };
}
