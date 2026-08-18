import { NextResponse } from "next/server";
import { apiKeyCreateSchema } from "@/server/validation";
import { apiKeyService } from "@/server/bootstrap";
import { apiKeyRepository } from "@/db/repository";
import { getSessionUser } from "@/server/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!user.verified) {
    return NextResponse.json({ code: "VERIFY_EMAIL" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = apiKeyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const issued = await apiKeyService.issue(parsed.data.name, parsed.data.rateLimit ?? 60, user.email);
  return NextResponse.json(issued, { status: 201 });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!user.verified) {
    return NextResponse.json({ code: "VERIFY_EMAIL" }, { status: 403 });
  }
  const keys = await apiKeyRepository.list(user.email);
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
