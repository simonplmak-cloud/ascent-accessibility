import { NextResponse } from "next/server";
import { getUserId } from "@/server/auth";
import { createSiteSubscriptionCheckout } from "@/server/stripe";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { clientSecret } = await createSiteSubscriptionCheckout(userId);
    return NextResponse.json({ clientSecret });
  } catch {
    return NextResponse.json(
      { code: "STRIPE_ERROR", message: "Payment is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
