import { NextResponse } from "next/server";
import { apiKeyRepository } from "@/db/repository";
import { getUserId } from "@/server/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const key = await apiKeyRepository.findById(id);
  if (!key) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  if (key.userId !== userId) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  await apiKeyRepository.revoke(id);
  return NextResponse.json({ ok: true });
}
