import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Open_Sans, Titillium_Web } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { SiteHeader, type HeaderAuthState } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { CookieBanner } from "@/components/shell/cookie-banner";
import { KeyboardProvider } from "@/components/efficiency/keyboard-provider";
import { THEME_STORAGE_KEY } from "@/lib/site/theme";
import { SITE_URL } from "@/lib/site/site-url";

// Runs before first paint to apply the stored theme and avoid a flash of the
// wrong theme. The server renders `<html class="dark">` (dark default); this
// removes the class when the user chose light.
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="light"){document.documentElement.classList.remove("dark");}}catch(e){}})();`;

// Brand pairing (ascent-partners.com): Open Sans for body/UI, Titillium Web for
// headings. Self-hosted via next/font (no render-blocking external request, no CLS).
const fontSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const fontDisplay = Titillium_Web({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const SITE_TITLE = "Free WCAG Assessment — Ascent Accessibility";
const SITE_DESCRIPTION =
  "Assess your website for accessibility — free, open source, and built by a registered charity. Get a plain-language report of what to fix, with evidence.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Ascent Accessibility",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Ascent Accessibility",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Ascent Accessibility — Free WCAG Assessment",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Ascent Accessibility",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Ascent Accessibility — Free WCAG assessments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascent Accessibility — Free WCAG Assessment",
    description: SITE_DESCRIPTION,
    images: ["/images/og-image.webp"],
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
};

// Structured data so search engines recognise the charity behind the tool.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ascent Partners Foundation",
  legalName: "Ascent Partners Foundation Limited",
  url: "https://www.ascent.partners",
  email: "contact@ascent-partners.com",
  foundingDate: "2017",
  description:
    "A Hong Kong registered charity connecting leaders with the tools to turn sustainability into action.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Auth is resolved client-side (SiteHeader fetches /api/auth/session on
  // mount), so the server renders statically without reading cookies — which
  // lets marketing pages be cached.
  const authState: HeaderAuthState = { signedIn: false, email: null };
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      className={`dark ${fontSans.variable} ${fontDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-terminal-bg text-terminal-fg antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <a href="#main" className="skip-link">
          {t("skipLink")}
        </a>
        <NextIntlClientProvider>
          <KeyboardProvider>
            <SiteHeader authState={authState} />
            <main id="main">{children}</main>
            <SiteFooter />
          </KeyboardProvider>
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
