import { getSiteUrl } from "@/lib/site-url";
import { logger } from "@/lib/observability/logger";

export async function sendMagicLinkEmail(email: string, token: string, next = "/assess"): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = getSiteUrl();
  const link = `${siteUrl}/api/auth/magic-link/callback?token=${token}&next=${encodeURIComponent(next)}`;
  const from = process.env.RESEND_FROM ?? "Ascent Accessibility <onboarding@resend.dev>";

  if (!apiKey) {
    // Loud in every environment: without a key the route otherwise reports
    // success while silently dropping the email, which is undiagnosable.
    logger.error("magic-link: RESEND_API_KEY is not set — email not sent");
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[dev] magic link for ${email}: ${link}`);
    }
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your sign-in link — Ascent Accessibility",
      text: `Click this link to sign in: ${link}\n\nThis link can be used once and expires shortly. If you didn't request it, you can ignore this email.`,
      html: `<p>Click the button below to sign in:</p><p><a href="${link}">Sign in to Ascent Accessibility</a></p><p>This link can be used once and expires shortly. If you didn't request it, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ status: res.status, body: body.slice(0, 300), from }, "magic-link: Resend send failed");
    throw new Error(`Resend API ${res.status}: ${body.slice(0, 300)}`);
  }

  logger.info({ from }, "magic-link: email sent");
}
