import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Ascent Accessibility — Free WCAG Assessment by Ascent Partners Foundation",
    template: "%s — Ascent Accessibility",
  },
  description:
    "A free tool by Ascent Partners Foundation. Assess your website against WCAG 2.2 AA and get a score, evidence-backed findings, and remediation guidance.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <body className="min-h-screen bg-terminal-bg text-terminal-fg antialiased">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
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
