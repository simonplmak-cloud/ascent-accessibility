import { NextResponse } from "next/server";
import { z } from "zod";
import { createConnection, dbConfig } from "@/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signInWithPassword,
} from "@/lib/auth/session";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email and password." },
      { status: 400 },
    );
  }

  const db = await createConnection();
  try {
    const result = await signInWithPassword(db, dbConfig(), parsed.data);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
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
