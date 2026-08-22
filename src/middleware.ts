import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const intlMiddleware = createMiddleware(routing);

// Compose next-intl locale routing with the auth gate. The scan form and the
// account area are login-gated in every locale; next-intl handles locale
// detection and prefix redirects for everything else.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth gate (locale-aware): `/assess` and `/account` in any locale.
  const isProtected =
    /^\/(zh-Hant|zh-Hans)?\/?assess(\/|$)/.test(pathname) ||
    /^\/(zh-Hant|zh-Hans)?\/?account(\/|$)/.test(pathname);
  if (isProtected) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const localePrefix = /^\/(zh-Hant|zh-Hans)(\/|$)/.exec(pathname)?.[1];
      const url = new URL(`${localePrefix ? `/${localePrefix}` : ""}/sign-in`, request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Locale routing for everything else.
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except API routes (/api/*), Next internals, and real static
  // files. Two deliberate choices: `api(?:/|$)` excludes only /api and /api/*
  // (not the /api-keys page); the extension list (not a bare `.*\..*`) allows
  // dotted page slugs like /training/lessons/sc-1.4.3.
  matcher: [
    "/((?!api(?:/|$)|_next|_vercel|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|map|json|xml|txt|woff|woff2|ttf|otf|pdf|webmanifest)$).*)",
  ],
};
