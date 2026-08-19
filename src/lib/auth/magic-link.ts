import { createHash, randomBytes } from "node:crypto";
import { query } from "@/db";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function mintMagicLinkToken(): string {
  return randomBytes(32).toString("hex");
}

// Creates the user if it does not exist (no password — a random placeholder is
// stored to satisfy SCHEMAFULL) and stores a one-time magic-link token.
export async function requestMagicLink(email: string): Promise<string> {
  const existing = await query("SELECT id FROM user WHERE email = $email LIMIT 1", { email });
  if (existing.length === 0) {
    await query(
      "CREATE user SET name = $name, email = $email, password = crypto::argon2::generate($password)",
      {
        name: email.split("@")[0] ?? "",
        email,
        password: randomBytes(32).toString("hex"),
      },
    );
  }

  const token = mintMagicLinkToken();
  await query("UPDATE user SET magicLinkToken = $hash WHERE email = $email", {
    hash: hashToken(token),
    email,
  });
  return token;
}

// Consumes the token: clears it and marks the account verified (one-time use).
export async function consumeMagicLinkToken(token: string): Promise<void> {
  await query("UPDATE user SET magicLinkToken = NONE, verified = true WHERE magicLinkToken = $hash", {
    hash: hashToken(token),
  });
}
