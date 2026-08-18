export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/verify?token=${token}`;
  const webhookUrl = process.env.N8N_EMAIL_WEBHOOK_URL;

  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback so the flow is testable without n8n configured.
      console.warn(`[dev] verification link for ${email}: ${link}`);
    }
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Verify your email — Ascent Accessibility",
        link,
      }),
    });
  } catch {
    // Email delivery failure must not block sign-up.
  }
}
