import { NextResponse } from "next/server";
import { getUserId } from "@/server/auth";
import { subscriptionRepository } from "@/db/repository";
import { createPortalSession } from "@/server/subscription";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const sub = await subscriptionRepository.findByUser(userId);
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const result = await createPortalSession(sub.stripeCustomerId);
  if (result.error) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: result.error }, { status: 503 });
  }
  return NextResponse.json({ url: result.url });
}
