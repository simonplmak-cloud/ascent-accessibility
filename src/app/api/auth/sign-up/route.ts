import { NextResponse } from "next/server";
import { z } from "zod";
import { createConnection, dbConfig } from "@/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signUpWithPassword,
} from "@/lib/auth/session";
import { mintToken, storeVerificationToken } from "@/lib/auth/verify";
import { sendVerificationEmail } from "@/lib/auth/email";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please provide valid details." },
      { status: 400 },
    );
  }

  const db = await createConnection();
  try {
    const result = await signUpWithPassword(db, dbConfig(), {
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Issue an email-verification token so the account is gated until confirmed.
    const token = mintToken();
    await storeVerificationToken(parsed.data.email, token);
    await sendVerificationEmail(parsed.data.email, token);

    const res = NextResponse.json({ ok: true, verified: false });
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
