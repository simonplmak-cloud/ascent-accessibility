// Programmatic disposable inbox (mail.tm / mail.gw) so the magic-link E2E can
// create an inbox, submit its address, poll for the Resend email, and extract
// the link — no human inbox needed. The API host is configurable via
// MAIL_API_URL (mail.gw is a fallback when mail.tm is rate-limited).
const API = process.env.MAIL_API_URL ?? "https://api.mail.tm";
const DOMAIN = process.env.MAIL_DOMAIN ?? (API.includes("mail.gw") ? "westcast-systems.com" : "emalupe.com");

export interface MailtmInbox {
  address: string;
  password: string;
  token: string;
}

export async function createMailtmInbox(): Promise<MailtmInbox> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const address = `e2e-${suffix}@${DOMAIN}`;
  const password = `e2e-pass-${suffix}`;

  const accountRes = await fetch(`${API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!accountRes.ok) {
    throw new Error(`inbox account creation failed: ${accountRes.status}`);
  }

  const tokenRes = await fetch(`${API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!tokenRes.ok) {
    throw new Error(`inbox token failed: ${tokenRes.status}`);
  }
  const tokenData = (await tokenRes.json()) as { token: string };

  return { address, password, token: tokenData.token };
}

interface MailtmMessage {
  id: string;
  text?: string;
  html?: string | string[];
}

export async function waitForMessage(
  inbox: MailtmInbox,
  timeoutMs = 90_000,
): Promise<MailtmMessage> {
  const start = Date.now();
  let last: MailtmMessage | null = null;
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${API}/messages`, {
      headers: { Authorization: `Bearer ${inbox.token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { "hydra:member": Array<{ id: string }> };
      const messages = data["hydra:member"] ?? [];
      if (messages.length > 0) {
        last = await fetchMessage(inbox, messages[0]!.id);
        if (last) return last;
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("no email received within timeout");
}

async function fetchMessage(inbox: MailtmInbox, id: string): Promise<MailtmMessage | null> {
  const res = await fetch(`${API}/messages/${id}`, {
    headers: { Authorization: `Bearer ${inbox.token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as MailtmMessage;
}

// Extracts the first absolute URL from an inbox message body.
export function extractLink(message: MailtmMessage): string {
  const body = message.text ?? (Array.isArray(message.html) ? message.html.join("") : message.html ?? "");
  const match = body.match(/https?:\/\/[^\s"'>]+/);
  if (!match) throw new Error("no link found in email");
  return match[0];
}
