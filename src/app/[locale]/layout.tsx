import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Open_Sans, Titillium_Web, Noto_Sans_TC, Noto_Sans_SC } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { SiteHeader, type HeaderAuthState } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { KeyboardProvider } from "@/components/efficiency/keyboard-provider";
import { getSessionUser } from "@/server/auth";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { SITE_URL } from "@/lib/site-url";

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
// CJK fallbacks for the Chinese locales (Traditional + Simplified).
const fontCjkTc = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cjk-tc",
  display: "swap",
});
const fontCjkSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cjk-sc",
  display: "swap",
});

const SITE_TITLE = "Ascent Accessibility — Free WCAG Assessment by Ascent Partners Foundation";
const SITE_DESCRIPTION =
  "A free tool by Ascent Partners Foundation. Assess your website against WCAG 2.2 AA and get a score, evidence-backed findings, and remediation guidance.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Ascent Accessibility",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Ascent Accessibility",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Ascent Accessibility — Free WCAG Assessment",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Ascent Accessibility",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
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
    images: ["/images/og-image.png"],
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

// Resolves the header's role (signed-in) without ever breaking the page: if the
// database is unreachable we degrade to the anonymous nav rather than throwing.
async function getHeaderAuthState(): Promise<HeaderAuthState> {
  try {
    const user = await getSessionUser();
    if (!user) return { signedIn: false, email: null };
    return { signedIn: true, email: user.email };
  } catch {
    return { signedIn: false, email: null };
  }
}

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

  const authState = await getHeaderAuthState();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      className={`dark ${fontSans.variable} ${fontDisplay.variable} ${fontCjkTc.variable} ${fontCjkSc.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-terminal-bg text-terminal-fg antialiased">
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
        </NextIntlClientProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
