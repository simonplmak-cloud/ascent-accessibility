import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/server/auth";
import { createStripe } from "@/server/stripe";
import { getSiteUrl } from "@/lib/site/site-url";
import { topupTiersUsd } from "@/lib/ai-review/balance";

const topupSchema = z.object({
  tier: z.number().int().positive(),
});

// Creates a one-time Stripe checkout to top up the account's AI-review balance.
// The session carries the account id so the webhook can credit it idempotently.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = topupSchema.safeParse(body);
  if (!parsed.success || !topupTiersUsd().includes(parsed.data.tier)) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const stripe = createStripe();
    const siteUrl = getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "elements",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "AI review credits" },
            unit_amount: parsed.data.tier * 100,
          },
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      metadata: { userId: user.id, kind: "ai-topup" },
      return_url: `${siteUrl}/account?session_id={CHECKOUT_SESSION_ID}`,
    });
    if (!session.client_secret) throw new Error("Stripe did not return a client secret");
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch {
    return NextResponse.json(
      { code: "STRIPE_ERROR", message: "Payment is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
