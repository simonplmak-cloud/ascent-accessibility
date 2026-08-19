import { randomBytes, createHash } from "node:crypto";
import { query } from "@/db";

export function mintToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function storeVerificationToken(email: string, token: string): Promise<void> {
  await query("UPDATE user SET emailVerificationToken = $token WHERE email = $email", {
    email,
    token: hashToken(token),
  });
}

export async function verifyEmail(token: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "UPDATE user SET verified = true, emailVerificationToken = NONE WHERE emailVerificationToken = $token RETURN AFTER",
    { token: hashToken(token) },
  );
  return rows.length > 0;
}
