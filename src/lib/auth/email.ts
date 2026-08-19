import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/verify?token=${token}`;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback so the flow is testable without SMTP configured.
      console.warn(`[dev] verification link for ${email}: ${link}`);
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
    subject: "Verify your email — Ascent Accessibility",
    text: `Verify your email to start scanning: ${link}`,
    html: `<p>Verify your email to start scanning:</p><p><a href="${link}">${link}</a></p>`,
  });
}
