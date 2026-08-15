import Stripe from "stripe";
import { subscriptionRepository } from "@/db/repository";

function createStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export interface CheckoutResult {
  url?: string;
  error?: string;
}

export async function createSubscriptionCheckout(
  userId: string,
  customerEmail: string,
): Promise<CheckoutResult> {
  const stripe = createStripe();
  if (!stripe) return { error: "STRIPE_SECRET_KEY is not configured" };

  const priceHkd = Number(process.env.STRIPE_SITE_PRICE_HKD ?? 280);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "hkd",
          unit_amount: Math.round(priceHkd * 100),
          recurring: { interval: "month" },
          product_data: { name: "Ascent Accessibility — Whole-site scans" },
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    client_reference_id: userId,
    metadata: { userId },
    success_url: `${siteUrl}/site?subscribed=1`,
    cancel_url: `${siteUrl}/site`,
  });

  if (!session.url) return { error: "Stripe did not return a checkout URL" };
  return { url: session.url };
}

export async function handleStripeWebhook(rawBody: string, signature: string | null): Promise<Response> {
  const stripe = createStripe();
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
