import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripe } from "@/server/stripe";
import { handleWebhookEvent } from "@/server/stripe-webhook";
import { subscriptionRepository } from "@/db/repository";
import { logger } from "@/lib/observability/logger";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Missing Stripe webhook secret or signature" },
      { status: 400 },
    );
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = createStripe();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    logger.warn({ error }, "stripe-webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event, subscriptionRepository);
  } catch (error) {
    logger.error({ error }, "stripe-webhook: handling failed");
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
