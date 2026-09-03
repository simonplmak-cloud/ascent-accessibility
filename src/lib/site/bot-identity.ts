import { createHmac } from "crypto";
import { SITE_URL } from "./site-url";

// Stable, self-identifying User-Agent. Changing this invalidates every existing
// allowlist — keep it versioned and documented on the /bot page.
export const BOT_USER_AGENT =
  process.env.BOT_USER_AGENT ?? `AscentAccessibilityBot/1.0 (+${SITE_URL}/bot)`;

// Comma-separated egress IP range(s) the scanner crawls from. Operators keep
// this in sync with the worker's real public IP(s) so owners allowlist correctly.
export const BOT_IP_RANGES: string[] = (process.env.BOT_IP_RANGES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Meta tag a site owner places on their pages to prove they authorized the scan
// (Google-Search-Console-style handshake). Value is the owner's verify token.
export const VERIFY_META_NAME = "ascent-verify";

// Per-owner verification token: HMAC-SHA256 of the owner's record id under the
// shared secret. Deterministic (no DB field) and secret-dependent.
export function verifyTokenFor(ownerId: string): string {
  const secret = process.env.SCAN_VERIFY_SECRET;
  if (!secret) {
    // Dev fallback — still deterministic per owner, but NOT secret. Prod must set
    // SCAN_VERIFY_SECRET for the token to be meaningful.
    return Buffer.from(ownerId).toString("base64url");
  }
  return createHmac("sha256", secret).update(ownerId).digest("hex");
}
