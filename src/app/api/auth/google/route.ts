import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSession } from "@/lib/auth/session";
import { linkOrCreateOAuth } from "@/lib/auth/identity";
import { verifyGoogleToken } from "@/lib/auth/google";
import { logger } from "@/lib/observability/logger";

const schema = z.object({
  credential: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    logger.warn("google-signin: missing credential");
    return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
  }

  const identity = await verifyGoogleToken(parsed.data.credential);
  if (!identity) {
    logger.warn("google-signin: verification failed");
    return NextResponse.json({ code: "INVALID_TOKEN" }, { status: 401 });
  }
  logger.info({ sub: identity.sub, email: identity.email }, "google-signin: verified");

  const userId = await linkOrCreateOAuth({
    provider: "google",
    subject: identity.sub,
    email: identity.email,
    name: identity.name,
    verified: identity.emailVerified,
  });

  logger.info({ email: identity.email }, "google-signin: session issued");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, issueSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
