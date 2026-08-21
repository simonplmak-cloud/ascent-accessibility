import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSession } from "@/lib/auth/session";
import { consumeMagicLink } from "@/lib/auth/identity";
import { logger } from "@/lib/observability/logger";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(req: Request) {
  const siteUrl = getSiteUrl();
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const rawNext = url.searchParams.get("next");
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/assess";
  const failUrl = `${siteUrl}/sign-in?error=magic-link`;

  if (!token) {
    return NextResponse.redirect(failUrl);
  }

  const result = await consumeMagicLink(token);
  if (!result) {
    logger.warn("magic-link: token invalid or expired");
    return NextResponse.redirect(failUrl);
  }

  logger.info({ email: result.email }, "magic-link: session issued");
  const res = NextResponse.redirect(`${siteUrl}${next}`);
  res.cookies.set(SESSION_COOKIE, issueSession(result.userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
