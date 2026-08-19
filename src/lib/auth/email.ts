import nodemailer from "nodemailer";

export async function sendMagicLinkEmail(email: string, token: string, next = "/site"): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/api/auth/magic-link/callback?token=${token}&next=${encodeURIComponent(next)}`;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback so the flow is testable without SMTP configured.
      console.warn(`[dev] magic link for ${email}: ${link}`);
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? user,
    to: email,
    subject: "Your sign-in link — Ascent Accessibility",
    text: `Click this link to sign in: ${link}\n\nThis link can be used once and expires shortly. If you didn't request it, you can ignore this email.`,
    html: `<p>Click the button below to sign in:</p><p><a href="${link}">Sign in to Ascent Accessibility</a></p><p>This link can be used once and expires shortly. If you didn't request it, you can ignore this email.</p>`,
  });
}
