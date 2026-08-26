import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSession } from "@/lib/auth/session";
import { linkOrCreateOAuth } from "@/lib/auth/identity";
import { providers, verifyOauthState, type OAuthIdentity } from "@/lib/auth/oauth";
import { logger } from "@/lib/observability/logger";
import { getSiteUrl } from "@/lib/site/site-url";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const provider = providers[providerId];
  const siteUrl = getSiteUrl();
  const failUrl = `${siteUrl}/sign-in?error=oauth`;

  if (!provider) {
    return NextResponse.redirect(failUrl);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    logger.warn({ hasCode: Boolean(code) }, "oauth: missing code or state");
    return NextResponse.redirect(failUrl);
  }

  const verifiedState = verifyOauthState(state);
  if (!verifiedState) {
    logger.warn("oauth: invalid state signature");
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

  const userId = await linkOrCreateOAuth(identity);

  logger.info({ provider: providerId, email: identity.email }, "oauth: session issued");
  const res = NextResponse.redirect(`${siteUrl}${verifiedState.next}`);
  res.cookies.set(SESSION_COOKIE, issueSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
