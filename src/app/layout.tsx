import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader, type HeaderAuthState } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionUser } from "@/server/auth";
import { subscriptionRepository } from "@/db/repository";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcag-score.ascent.partners";

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
        url: "/images/apf-logo.png",
        width: 222,
        height: 87,
        alt: "Ascent Partners Foundation",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Ascent Accessibility — Free WCAG Assessment",
    description: SITE_DESCRIPTION,
  },
  manifest: "/manifest.webmanifest",
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

// Resolves the header's role (signed-in / subscriber) without ever breaking the
// page: if the database is unreachable we degrade to the anonymous nav rather
// than throwing (which is what used to surface the "Something went wrong" page).
async function getHeaderAuthState(): Promise<HeaderAuthState> {
  try {
    const user = await getSessionUser();
    if (!user) return { signedIn: false, subscribed: false, email: null };
    const subscribed = await subscriptionRepository.isActive(user.email);
    return { signedIn: true, subscribed, email: user.email };
  } catch {
    return { signedIn: false, subscribed: false, email: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authState = await getHeaderAuthState();

  const body = (
    <body className="min-h-screen bg-terminal-bg text-terminal-fg antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
      />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader authState={authState} />
      <main id="main">{children}</main>
      <SiteFooter />
    </body>
  );

  return (
    <html lang="en">
      {body}
    </html>
  );
}
