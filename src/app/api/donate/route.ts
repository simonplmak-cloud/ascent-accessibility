import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/server/stripe";

const donateSchema = z.object({
  amount: z.number().min(1).max(10000),
  recurring: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = donateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  try {
    const { clientSecret } = await createCheckoutSession(
      parsed.data.amount,
      undefined,
      parsed.data.recurring,
    );
    return NextResponse.json({ clientSecret });
  } catch {
    return NextResponse.json(
      { code: "STRIPE_ERROR", message: "Payment is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
