import { NextResponse } from "next/server";
import { apiKeyRepository } from "@/db/repository";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const key = await apiKeyRepository.findById(id);
  if (!key) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  await apiKeyRepository.revoke(id);
  return NextResponse.json({ ok: true });
}
