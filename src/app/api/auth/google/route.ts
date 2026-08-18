import { NextResponse } from "next/server";
import { z } from "zod";
import { createConnection, dbConfig } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { signInWithGoogle, verifyGoogleToken } from "@/lib/auth/google";

const schema = z.object({
  credential: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
  }

  const identity = await verifyGoogleToken(parsed.data.credential);
  if (!identity) {
    return NextResponse.json({ code: "INVALID_TOKEN" }, { status: 401 });
  }

  const db = await createConnection();
  try {
    const result = await signInWithGoogle(db, dbConfig(), identity);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, verified: identity.emailVerified });
    res.cookies.set(SESSION_COOKIE, result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } finally {
    await db.close();
  }
}
