import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createConnection, dbConfig } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { providers, signInWithOAuth, type OAuthIdentity } from "@/lib/auth/oauth";
import { logger } from "@/lib/observability/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const provider = providers[providerId];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const failUrl = `${siteUrl}/sign-in?error=oauth`;

  if (!provider) {
    return NextResponse.redirect(failUrl);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const store = await cookies();
  const cookieState = store.get("oauth_state")?.value;
  const next = store.get("oauth_next")?.value ?? "/site";

  if (!code || !state || state !== cookieState) {
    logger.warn(
      { hasCode: Boolean(code), urlState: state, cookieState: cookieState ?? null },
      "oauth: state mismatch",
    );
    return NextResponse.redirect(failUrl);
  }

  const redirectUri = `${siteUrl}/api/auth/oauth/${providerId}/callback`;

  let identity: OAuthIdentity;
  try {
    identity = await provider.exchange(code, redirectUri);
  } catch (error) {
    logger.warn({ error }, "oauth: code exchange failed");
    return NextResponse.redirect(failUrl);
  }

  const db = await createConnection();
  try {
    const result = await signInWithOAuth(db, dbConfig(), identity);
    if (!result.ok) {
      logger.warn({ error: result.error }, "oauth: sign-in failed");
      return NextResponse.redirect(failUrl);
    }

    logger.info({ provider: providerId, email: identity.email }, "oauth: session minted");
    const res = NextResponse.redirect(`${siteUrl}${next}`);
    res.cookies.set(SESSION_COOKIE, result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    res.cookies.set("oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
    res.cookies.set("oauth_next", "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  } finally {
    await db.close();
  }
}
