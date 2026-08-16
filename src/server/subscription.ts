import Stripe from "stripe";
import { subscriptionRepository } from "@/db/repository";
import { checkoutBranding, getStripe } from "@/server/stripe";

export interface CheckoutResult {
  url?: string;
  clientSecret?: string;
  error?: string;
}

export async function createPortalSession(customerId: string): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) return { error: "STRIPE_SECRET_KEY is not configured" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const configuration = process.env.STRIPE_PORTAL_CONFIG_ID;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/site`,
      ...(configuration ? { configuration } : {}),
    });
    if (!session.url) return { error: "Stripe did not return a portal URL" };
    return { url: session.url };
  } catch {
    return { error: "Could not open the billing portal. Please try again." };
  }
}

export async function createSubscriptionCheckout(
  userId: string,
  customerEmail: string,
): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) return { error: "STRIPE_SECRET_KEY is not configured" };

  const priceUsd = Number(process.env.STRIPE_SITE_PRICE_USD ?? 28);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      submit_type: "subscribe",
      allow_promotion_codes: true,
      branding_settings: checkoutBranding(),
      custom_text: {
        submit: { message: "Subscribe to unlock whole-website scans." },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(priceUsd * 100),
            recurring: { interval: "month" },
            product_data: { name: "Ascent Accessibility — Whole-site scans" },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      client_reference_id: userId,
      metadata: { userId },
      return_url: `${siteUrl}/site?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) return { error: "Stripe did not return a client secret" };
    return { clientSecret: session.client_secret };
  } catch {
    return { error: "Could not start checkout. Please try again." };
  }
}

export async function handleStripeWebhook(rawBody: string, signature: string | null): Promise<Response> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId ?? session.client_reference_id;
    if (userId && session.customer && session.subscription) {
      await subscriptionRepository.activate(
        userId,
        String(session.customer),
        String(session.subscription),
      );
    }
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await subscriptionRepository.deactivateByStripeSub(sub.id);
  }

  return Response.json({ received: true });
}
