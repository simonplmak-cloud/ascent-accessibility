import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { query } from "@/db";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const secret = process.env.BYOK_ENCRYPTION_SECRET;
  if (!secret) throw new Error("BYOK_ENCRYPTION_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

export interface EncryptedKey {
  iv: string;
  tag: string;
  ciphertext: string;
}

export function encryptKey(plaintext: string): EncryptedKey {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: enc.toString("base64"),
  };
}

export function decryptKey(encrypted: EncryptedKey): string {
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(encrypted.iv, "base64"));
  decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export function maskKey(plaintext: string): string {
  if (plaintext.length <= 4) return "••••";
  return `••••${plaintext.slice(-4)}`;
}

// Cheap DashScope validation call (list models) using the supplied key.
export async function validateKey(
  apiKey: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const baseUrl = (
    process.env.QWEN_BASE_URL ?? "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
  ).replace(/\/$/, "");
  try {
    const res = await fetchFn(`${baseUrl}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Resolves an account's stored (encrypted) Qwen key by account id, returning
// plaintext or null. Used by the worker to build the per-assessment AI model.
export async function resolveOwnerApiKey(ownerId: string): Promise<string | null> {
  const rows = await query<{ qwenApiKey: string | null }>(
    "SELECT qwenApiKey FROM user WHERE id = type::record($id) LIMIT 1",
    { id: ownerId },
  );
  const raw = rows[0]?.qwenApiKey;
  if (!raw) return null;
  try {
    return decryptKey(JSON.parse(raw) as EncryptedKey);
  } catch {
    return null;
  }
}
