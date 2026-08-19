export async function sendMagicLinkEmail(email: string, token: string, next = "/site"): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/api/auth/magic-link/callback?token=${token}&next=${encodeURIComponent(next)}`;
  const from = process.env.RESEND_FROM ?? "Ascent Accessibility <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback so the flow is testable without Resend configured.
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
    throw new Error(`Resend API ${res.status}: ${body.slice(0, 300)}`);
  }
}
