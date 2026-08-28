import { createHmac, timingSafeEqual } from "node:crypto";
import { query } from "@/db";
import { logger } from "@/lib/observability/logger";

// --- Email canonicalization ---
// The canonical compartment key: trim + lowercase. The domain is
// case-insensitive; the local part is treated case-insensitively too, matching
// the vast majority of providers (conservative, no Gmail dot/`+` tricks).
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// --- Stateless magic-link tokens (HMAC-signed, short-TTL) ---
const MAGIC_LINK_TTL_SECONDS = 15 * 60; // 15 min

function tokenSecret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function sign(payload: string): string {
  return createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
}

function b64url(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function b64urlDecode(data: string): Buffer {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function issueMagicLinkToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({ typ: "magic-link", email: normalizeEmail(email), exp: now + MAGIC_LINK_TTL_SECONDS }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyMagicLinkToken(token: string): { email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts as [string, string];
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const data = JSON.parse(b64urlDecode(payload).toString("utf8")) as {
      typ?: unknown;
      email?: unknown;
      exp?: unknown;
    };
    if (data.typ !== "magic-link") return null;
    if (typeof data.email !== "string" || typeof data.exp !== "number") return null;
    if (data.exp * 1000 < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

// --- OAuth identity + resolution ---
export interface OAuthIdentity {
  provider: string; // "google" | "github" | "microsoft"
  subject: string; // provider-stable subject (sub, numeric id, tid+oid)
  email: string;
  name?: string;
  verified: boolean; // true when the provider confirmed email ownership
}

// Thrown when an unverified identity tries to claim an email already owned by
// another account (pre-hijacking guard).
export class EmailConflictError extends Error {
  constructor(email: string) {
    super(`Email already associated with another account: ${email}`);
    this.name = "EmailConflictError";
  }
}

async function createOauthLink(userId: string, provider: string, subject: string): Promise<void> {
  await query(
    "CREATE user_oauth_link SET user = type::record($user), provider = $p, subject = $s",
    { user: userId, p: provider, s: subject },
  );
}

// Canonical: find a user by normalized email, or create one. Upgrades an
// existing unverified email when the incoming login is verified; rejects an
// unverified identity that tries to claim an email already owned elsewhere
// (pre-hijacking guard).
async function resolveUserByEmail(email: string, verified: boolean, name: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const row = await query<{ user: string; verified: boolean }>(
    "SELECT user, verified FROM user_email WHERE email = $email LIMIT 1",
    { email: normalized },
  );
  if (row[0]?.user) {
    if (!verified) {
      throw new EmailConflictError(email);
    }
    if (!row[0].verified) {
      await query("UPDATE user_email SET verified = true WHERE email = $email", { email: normalized });
    }
    return row[0].user;
  }
  const created = await query<{ id: string }>("CREATE user SET name = $name", { name });
  const userId = created[0]!.id;
  await query(
    "CREATE user_email SET user = type::record($user), email = $email, verified = $verified, primary = true",
    { user: userId, email: normalized, verified },
  );
  return userId;
}

export async function linkOrCreateOAuth(identity: OAuthIdentity): Promise<string> {
  // 1. Already linked by (provider, subject).
  const link = await query<{ user: string }>(
    "SELECT user FROM user_oauth_link WHERE provider = $p AND subject = $s LIMIT 1",
    { p: identity.provider, s: identity.subject },
  );
  if (link[0]?.user) return link[0].user;

  // 2. Resolve-or-create by email (linking + verification upgrade; the
  //    resolver throws EmailConflictError on unverified-email collisions).
  const userId = await resolveUserByEmail(
    identity.email,
    identity.verified,
    identity.name ?? identity.email.split("@")[0] ?? "",
  );

  // 3. Attach the OAuth link (idempotent; handle the UNIQUE race).
  try {
    await createOauthLink(userId, identity.provider, identity.subject);
  } catch (error) {
    const winner = await query<{ user: string }>(
      "SELECT user FROM user_oauth_link WHERE provider = $p AND subject = $s LIMIT 1",
      { p: identity.provider, s: identity.subject },
    );
    if (winner[0]?.user) return winner[0].user;
    logger.warn({ error }, "identity: link race unresolved");
  }
  return userId;
}

// Request a magic link — stateless: no DB write, no user created until the
// email is verified by clicking the link.
export function requestMagicLink(email: string): string {
  return issueMagicLinkToken(email);
}

// Consume a magic link: verify the signed token, then resolve-or-create the
// user with a VERIFIED email.
export async function consumeMagicLink(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  const verified = verifyMagicLinkToken(token);
  if (!verified) return null;
  const userId = await resolveUserByEmail(
    verified.email,
    true,
    verified.email.split("@")[0] ?? "",
  );
  return { userId, email: verified.email };
}
