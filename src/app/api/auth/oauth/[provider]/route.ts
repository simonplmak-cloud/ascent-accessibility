import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { providers } from "@/lib/auth/oauth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const provider = providers[providerId];
  if (!provider) {
    return new NextResponse("Not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/auth/oauth/${providerId}/callback`;
  const state = randomBytes(16).toString("hex");
  const next = new URL(req.url).searchParams.get("next") ?? "/site";

  const res = NextResponse.redirect(provider.authorizeUrl(redirectUri, state));
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.cookies.set("oauth_next", next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
