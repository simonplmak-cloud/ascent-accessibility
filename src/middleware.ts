import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // `/assess` (the scan form) is login-gated; the shareable report at
  // `/assess/[id]` (moving to `/auditor/report/[id]`) stays public.
  const isProtected = pathname === "/assess" || pathname.startsWith("/account");
  if (!isProtected) return NextResponse.next();

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/assess", "/account/:path*"],
};
