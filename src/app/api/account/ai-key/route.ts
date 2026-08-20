import { NextResponse } from "next/server";
import { query } from "@/db";
import { getSessionUser } from "@/server/auth";
import { decryptKey, encryptKey, maskKey, validateKey, type EncryptedKey } from "@/server/byok";
import { getProvider } from "@/lib/ai-review/providers";

const DEFAULT_PROVIDER = "openrouter";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    apiKey?: unknown;
    provider?: unknown;
    baseUrl?: unknown;
  };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const providerId = typeof body.provider === "string" && body.provider ? body.provider : DEFAULT_PROVIDER;
  const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim() : undefined;

  if (!apiKey) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }
  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ code: "INVALID_PROVIDER" }, { status: 400 });
  }
  if (providerId === "custom" && (!baseUrl || !/^https:\/\//i.test(baseUrl))) {
    return NextResponse.json({ code: "INVALID_BASE_URL" }, { status: 400 });
  }

  const valid = await validateKey(providerId, apiKey, baseUrl);
  if (!valid) {
    return NextResponse.json({ code: "INVALID_KEY" }, { status: 400 });
  }

  const encrypted = encryptKey(apiKey);
  await query(
    "UPDATE user SET aiApiKey = $enc, aiProvider = $provider, aiBaseUrl = $baseUrl WHERE id = type::record($id)",
    { enc: JSON.stringify(encrypted), provider: providerId, baseUrl: baseUrl ?? null, id: user.id },
  );
  return NextResponse.json({ set: true, masked: maskKey(apiKey), provider: providerId });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const rows = await query<{ aiApiKey: string | null; aiProvider: string | null }>(
    "SELECT aiApiKey, aiProvider FROM user WHERE id = type::record($id) LIMIT 1",
    { id: user.id },
  );
  const raw = rows[0]?.aiApiKey;
  if (!raw) return NextResponse.json({ set: false });
  try {
    const decrypted = decryptKey(JSON.parse(raw) as EncryptedKey);
    return NextResponse.json({
      set: true,
      masked: maskKey(decrypted),
      provider: rows[0]?.aiProvider ?? DEFAULT_PROVIDER,
    });
  } catch {
    return NextResponse.json({ set: false });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  await query(
    "UPDATE user SET aiApiKey = NONE, aiBaseUrl = NONE WHERE id = type::record($id)",
    { id: user.id },
  );
  return NextResponse.json({ set: false });
}
