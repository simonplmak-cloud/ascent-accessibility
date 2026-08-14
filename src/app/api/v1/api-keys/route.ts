import { NextResponse } from "next/server";
import { apiKeyCreateSchema } from "@/server/validation";
import { apiKeyService } from "@/server/bootstrap";
import { apiKeyRepository } from "@/db/repository";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = apiKeyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const issued = await apiKeyService.issue(parsed.data.name, parsed.data.rateLimit ?? 60);
  return NextResponse.json(issued, { status: 201 });
}

export async function GET() {
  const keys = await apiKeyRepository.list();
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
