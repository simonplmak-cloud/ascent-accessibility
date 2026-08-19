import { createHash, randomBytes } from "node:crypto";
import { query } from "@/db";
import { logger } from "@/lib/observability/logger";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function mintToken(): string {
  return randomBytes(32).toString("hex");
}

export interface OAuthIdentity {
  provider: string; // "google" | "github" | "microsoft" | ...
  subject: string; // provider-specific user id
  email: string;
  name?: string;
  verified: boolean; // true when the provider confirmed the email
}

async function createOauthLink(userId: string, provider: string, subject: string): Promise<void> {
  await query(
    "CREATE user_oauth_link SET user = type::record($user), provider = $p, subject = $s",
    { user: userId, p: provider, s: subject },
  );
}

// Resolves an OAuth identity to an account: find by link, else link by verified
// email, else create a new account. Returns the account id.
export async function linkOrCreateOAuth(identity: OAuthIdentity): Promise<string> {
  // 1. Already linked by (provider, subject).
  const link = await query<{ user: string }>(
    "SELECT user FROM user_oauth_link WHERE provider = $p AND subject = $s LIMIT 1",
    { p: identity.provider, s: identity.subject },
  );
  if (link[0]?.user) return link[0].user;

  // 2. Silent auto-link to an existing account by verified email.
  if (identity.verified) {
    const emailRow = await query<{ user: string }>(
      "SELECT user FROM user_email WHERE email = $email AND verified = true LIMIT 1",
      { email: identity.email },
    );
    if (emailRow[0]?.user) {
      try {
        await createOauthLink(emailRow[0].user, identity.provider, identity.subject);
      } catch (error) {
        // UNIQUE race: another request just linked it — re-resolve.
        const winner = await query<{ user: string }>(
          "SELECT user FROM user_oauth_link WHERE provider = $p AND subject = $s LIMIT 1",
          { p: identity.provider, s: identity.subject },
        );
        if (winner[0]?.user) return winner[0].user;
        logger.warn({ error }, "identity: link race unresolved");
      }
      return emailRow[0].user;
    }
  }

  // 3. New account + email + link.
  const created = await query<{ id: string }>(
    "CREATE user SET name = $name",
    { name: identity.name ?? identity.email.split("@")[0] ?? "" },
  );
  const userId = created[0]!.id;
  await query(
    "CREATE user_email SET user = type::record($user), email = $email, verified = $verified, primary = true",
    { user: userId, email: identity.email, verified: identity.verified },
  );
  await createOauthLink(userId, identity.provider, identity.subject);
  return userId;
}

// Magic-link request: find the account by email, else create one; set a
// one-time token and return the raw token (to email).
export async function requestMagicLink(email: string): Promise<string> {
  const existing = await query<{ user: string }>(
    "SELECT user FROM user_email WHERE email = $email LIMIT 1",
    { email },
  );

  if (!existing[0]?.user) {
    const created = await query<{ id: string }>(
      "CREATE user SET name = $name",
      { name: email.split("@")[0] ?? "" },
    );
    await query(
      "CREATE user_email SET user = type::record($user), email = $email, verified = false, primary = true",
      { user: created[0]!.id, email },
    );
  }

  const token = mintToken();
  await query("UPDATE user_email SET magicLinkToken = $hash WHERE email = $email", {
    hash: hashToken(token),
    email,
  });
  return token;
}

// Consume a magic-link token: mark the email verified, return the account.
export async function consumeMagicLink(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  const rows = await query<{ user: string; email: string }>(
    "UPDATE user_email SET magicLinkToken = NONE, verified = true WHERE magicLinkToken = $hash RETURN user, email",
    { hash: hashToken(token) },
  );
  const row = rows[0];
  if (!row?.user) return null;
  return { userId: row.user, email: row.email };
}
