import { NextResponse } from "next/server";
import { getUserId } from "@/server/auth";
import { subscriptionRepository } from "@/db/repository";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const subscribed = await subscriptionRepository.isActive(userId);
  return NextResponse.json({ subscribed });
}
