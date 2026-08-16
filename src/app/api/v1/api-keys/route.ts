import { NextResponse } from "next/server";
import { apiKeyCreateSchema } from "@/server/validation";
import { apiKeyService } from "@/server/bootstrap";
import { apiKeyRepository, subscriptionRepository } from "@/db/repository";
import { getSessionUser, getUserId } from "@/server/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const subscribed = await subscriptionRepository.isActive(user.id);
  if (!subscribed) {
    return NextResponse.json({ code: "PAYMENT_REQUIRED" }, { status: 402 });
  }

  const body = await req.json().catch(() => null);
  const parsed = apiKeyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const issued = await apiKeyService.issue(parsed.data.name, parsed.data.rateLimit ?? 60, user.id);
  return NextResponse.json(issued, { status: 201 });
}

export async function GET() {
  const userId = await getUserId();
  const keys = await apiKeyRepository.list(userId);
  return NextResponse.json(
    keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      status: key.status,
      rateLimit: key.rateLimit,
    })),
  );
}
