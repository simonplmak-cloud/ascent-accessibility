import { NextResponse } from "next/server";
import { query } from "@/db";
import { getSessionUser } from "@/server/auth";
import { decryptKey, encryptKey, maskKey, validateKey, type EncryptedKey } from "@/server/byok";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { apiKey?: unknown };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const valid = await validateKey(apiKey);
  if (!valid) {
    return NextResponse.json({ code: "INVALID_KEY" }, { status: 400 });
  }

  const encrypted = encryptKey(apiKey);
  await query("UPDATE user SET qwenApiKey = $enc WHERE id = type::record($id)", {
    enc: JSON.stringify(encrypted),
    id: user.id,
  });
  return NextResponse.json({ set: true, masked: maskKey(apiKey) });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const rows = await query<{ qwenApiKey: string | null }>(
    "SELECT qwenApiKey FROM user WHERE id = type::record($id) LIMIT 1",
    { id: user.id },
  );
  const raw = rows[0]?.qwenApiKey;
  if (!raw) return NextResponse.json({ set: false });
  try {
    const decrypted = decryptKey(JSON.parse(raw) as EncryptedKey);
    return NextResponse.json({ set: true, masked: maskKey(decrypted) });
  } catch {
    return NextResponse.json({ set: false });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  await query("UPDATE user SET qwenApiKey = NONE WHERE id = type::record($id)", { id: user.id });
  return NextResponse.json({ set: false });
}
