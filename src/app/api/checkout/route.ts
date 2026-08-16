import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { createSubscriptionCheckout } from "@/server/subscription";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const result = await createSubscriptionCheckout(user.id, user.email);

  if (result.error) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: result.error }, { status: 503 });
  }
  return NextResponse.json({ url: result.url });
}
