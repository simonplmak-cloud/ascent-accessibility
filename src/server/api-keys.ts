import { createHash, randomBytes } from "node:crypto";

export type AuthResult =
  | { ok: true; apiKeyId: string; userId: string | null; rateLimit: number }
  | { ok: false; reason: "missing" | "invalid" | "revoked" | "expired" };

export interface StoredApiKey {
  id: string;
  status: string;
  rateLimit: number;
  userId: string | null;
  expiresAt: Date | null;
}

export interface ApiKeyStore {
  findByHash(hash: string): Promise<StoredApiKey | undefined>;
  create(input: {
    name: string;
    keyHash: string;
    keyPrefix: string;
    rateLimit: number;
    userId: string | null;
  }): Promise<{ id: string }>;
}

export interface ApiKeyService {
  issue(
    name: string,
    rateLimit: number,
    userId: string | null,
  ): Promise<{ id: string; key: string; keyPrefix: string }>;
  authenticate(rawKey: string | undefined): Promise<AuthResult>;
}

export function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateKey(): string {
  return `ak_${randomBytes(24).toString("base64url")}`;
}

export function keyPrefix(rawKey: string): string {
  return rawKey.slice(0, 11);
}

export function createApiKeyService(store: ApiKeyStore): ApiKeyService {
  return {
    async issue(name, rateLimit, userId) {
      const key = generateKey();
      const { id } = await store.create({
        name,
        keyHash: hashKey(key),
        keyPrefix: keyPrefix(key),
        rateLimit,
        userId,
      });
      return { id, key, keyPrefix: keyPrefix(key) };
    },

    async authenticate(rawKey) {
      if (!rawKey) return { ok: false, reason: "missing" };
      const stored = await store.findByHash(hashKey(rawKey));
      if (!stored) return { ok: false, reason: "invalid" };
      if (stored.status !== "active") return { ok: false, reason: "revoked" };
      if (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) {
        return { ok: false, reason: "expired" };
      }
      return { ok: true, apiKeyId: stored.id, userId: stored.userId, rateLimit: stored.rateLimit };
    },
  };
}
