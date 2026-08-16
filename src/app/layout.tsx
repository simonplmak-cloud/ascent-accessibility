import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, type HeaderAuthState } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSessionUser } from "@/server/auth";
import { subscriptionRepository } from "@/db/repository";

export const metadata: Metadata = {
  title: {
    default: "Ascent Accessibility — Free WCAG Assessment by Ascent Partners Foundation",
    template: "%s — Ascent Accessibility",
  },
  description:
    "A free tool by Ascent Partners Foundation. Assess your website against WCAG 2.2 AA and get a score, evidence-backed findings, and remediation guidance.",
  icons: { icon: "/favicon.png" },
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
