import { NextResponse } from "next/server";
import { createConnection, dbConfig } from "@/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { consumeMagicLinkToken, hashToken } from "@/lib/auth/magic-link";
import { logger } from "@/lib/observability/logger";

function extractToken(result: unknown): string | null {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    if (typeof r.access === "string") return r.access;
    if (typeof r.token === "string") return r.token;
  }
  return null;
}

export async function GET(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const rawNext = url.searchParams.get("next");
  const next = rawNext?.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/site";
  const failUrl = `${siteUrl}/sign-in?error=magic-link`;

  if (!token) {
    return NextResponse.redirect(failUrl);
  }

  const db = await createConnection();
  try {
    let sessionToken: string | null = null;
    try {
      const cfg = dbConfig();
      const signin = await db.signin({
        namespace: cfg.namespace,
        database: cfg.database,
        access: "user_magic",
        variables: { token: hashToken(token) },
      });
      sessionToken = extractToken(signin);
    } catch (error) {
      logger.warn({ error }, "magic-link: signin failed");
    }

    if (!sessionToken) {
      return NextResponse.redirect(failUrl);
    }

    await consumeMagicLinkToken(token);

    logger.info("magic-link: session minted");
    const res = NextResponse.redirect(`${siteUrl}${next}`);
    res.cookies.set(SESSION_COOKIE, sessionToken, {
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
