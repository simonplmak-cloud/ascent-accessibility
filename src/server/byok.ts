import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { query } from "@/db";
import { validateProviderKey } from "@/lib/ai-review/factory";
import { DEFAULT_PROVIDER } from "@/lib/ai-review/providers";

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

// Cheap, time-boxed validation call against the selected provider.
export async function validateKey(
  providerId: string,
  apiKey: string,
  baseUrl?: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  return validateProviderKey(providerId, apiKey, baseUrl, fetchFn);
}

export interface OwnerAiConfig {
  providerId: string;
  apiKey: string;
  baseUrl: string | null;
  visionModelId: string | null;
  audioModelId: string | null;
}

// Resolves an account's stored (encrypted) AI key + provider/model prefs by
// account id, returning plaintext + prefs, or null when no key is saved.
export async function resolveOwnerAi(ownerId: string): Promise<OwnerAiConfig | null> {
  const rows = await query<{
    aiApiKey: string | null;
    aiProvider: string | null;
    aiBaseUrl: string | null;
    aiVisionModel: string | null;
    aiAudioModel: string | null;
  }>(
    "SELECT aiApiKey, aiProvider, aiBaseUrl, aiVisionModel, aiAudioModel FROM user WHERE id = type::record($id) LIMIT 1",
    { id: ownerId },
  );
  const row = rows[0];
  const raw = row?.aiApiKey;
  if (!raw) return null;
  try {
    return {
      providerId: row.aiProvider ?? DEFAULT_PROVIDER,
      apiKey: decryptKey(JSON.parse(raw) as EncryptedKey),
      baseUrl: row.aiBaseUrl ?? null,
      visionModelId: row.aiVisionModel ?? null,
      audioModelId: row.aiAudioModel ?? null,
    };
  } catch {
    return null;
  }
}
