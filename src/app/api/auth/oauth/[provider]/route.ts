import { NextResponse } from "next/server";
import { providers, createOauthState } from "@/lib/auth/oauth";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await params;
  const provider = providers[providerId];
  if (!provider) {
    return new NextResponse("Not found", { status: 404 });
  }

  const siteUrl = getSiteUrl();
  const redirectUri = `${siteUrl}/api/auth/oauth/${providerId}/callback`;
  const rawNext = new URL(req.url).searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/site";
  const state = createOauthState(next);

  return NextResponse.redirect(provider.authorizeUrl(redirectUri, state));
}
