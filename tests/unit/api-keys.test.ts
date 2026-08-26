import { describe, expect, it, vi } from "vitest";
import {
  createApiKeyService,
  generateKey,
  hashKey,
  keyPrefix,
  type ApiKeyStore,
} from "@/server/api-keys";

function makeStore(overrides: Partial<ApiKeyStore> = {}): ApiKeyStore {
  return {
    findByHash: vi.fn(async () => undefined),
    create: vi.fn(async () => ({ id: "key-1" })),
    ...overrides,
  };
}

describe("key helpers", () => {
  it("hashes keys deterministically with SHA-256", () => {
    expect(hashKey("abc")).toBe(hashKey("abc"));
    expect(hashKey("abc")).not.toBe(hashKey("abd"));
    expect(hashKey("abc")).toHaveLength(64);
  });

  it("generates prefixed keys", () => {
    expect(generateKey()).toMatch(/^ak_/);
    expect(keyPrefix("ak_abcdefgh_rest")).toBe("ak_abcdefgh");
  });
});

describe("createApiKeyService", () => {
  it("issues a key and stores only its hash", async () => {
    const store = makeStore();
    const service = createApiKeyService(store);
    const issued = await service.issue("CI", 60, "user-1");

    expect(issued.key).toMatch(/^ak_/);
    expect(issued.keyPrefix).toBe(issued.key.slice(0, 11));
    expect(store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "CI",
        rateLimit: 60,
        keyHash: hashKey(issued.key),
        userId: "user-1",
      }),
    );
  });

  it("returns missing when no key is provided (AC-E6)", async () => {
    const service = createApiKeyService(makeStore());
    await expect(service.authenticate(undefined)).resolves.toEqual({
      ok: false,
      reason: "missing",
    });
  });

  it("returns invalid for an unknown key (AC-E6)", async () => {
    const service = createApiKeyService(makeStore());
    await expect(service.authenticate("ak_unknown")).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("returns revoked for a non-active key", async () => {
    const service = createApiKeyService(
      makeStore({
        findByHash: vi.fn(async () => ({
          id: "key-1",
          status: "revoked",
          rateLimit: 60,
          userId: "user-1",
          expiresAt: null,
        })),
      }),
    );
    await expect(service.authenticate("ak_whatever")).resolves.toEqual({
      ok: false,
      reason: "revoked",
    });
  });

  it("returns expired for an expired key", async () => {
    const service = createApiKeyService(
      makeStore({
        findByHash: vi.fn(async () => ({
          id: "key-1",
          status: "active",
          rateLimit: 60,
          userId: "user-1",
          expiresAt: new Date(Date.now() - 1000),
        })),
      }),
    );
    await expect(service.authenticate("ak_whatever")).resolves.toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("returns ok with the key rate limit for a valid key (AC-12)", async () => {
    const service = createApiKeyService(
      makeStore({
        findByHash: vi.fn(async () => ({
          id: "key-1",
          status: "active",
          rateLimit: 120,
          userId: "user-1",
          expiresAt: null,
        })),
      }),
    );
    await expect(service.authenticate("ak_valid")).resolves.toEqual({
      ok: true,
      apiKeyId: "key-1",
      userId: "user-1",
      rateLimit: 120,
    });
  });

  it("rejects an active key with no owner (prevents owner-less assessments)", async () => {
    const service = createApiKeyService(
      makeStore({
        findByHash: vi.fn(async () => ({
          id: "key-1",
          status: "active",
          rateLimit: 60,
          userId: null,
          expiresAt: null,
        })),
      }),
    );
    await expect(service.authenticate("ak_orphaned")).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
  });
});
