import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserId } from "@/server/auth";
import { createSubscriptionCheckout } from "@/server/subscription";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const result = await createSubscriptionCheckout(userId, email);

  if (result.error) {
    return NextResponse.json({ code: "NOT_CONFIGURED", message: result.error }, { status: 503 });
  }
  return NextResponse.json({ url: result.url });
}
