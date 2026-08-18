import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth/verify";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { token?: unknown };
  const token = body?.token;
  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ code: "INVALID_TOKEN" }, { status: 400 });
  }

  const ok = await verifyEmail(token);
  if (!ok) {
    return NextResponse.json({ code: "INVALID_TOKEN" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
