import { beforeAll, describe, expect, it } from "vitest";
import { decryptKey, encryptKey, maskKey, validateKey } from "@/server/byok";

beforeAll(() => {
  process.env.BYOK_ENCRYPTION_SECRET = "test-secret";
});

describe("byok (encrypt/decrypt/mask/validate)", () => {
  it("round-trips encryption", () => {
    const plaintext = "sk-1234567890abcdef";
    const encrypted = encryptKey(plaintext);
    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.ciphertext).not.toContain(plaintext);
    expect(decryptKey(encrypted)).toBe(plaintext);
  });

  it("masks to the last 4 characters", () => {
    expect(maskKey("sk-1234567890abcd")).toBe("••••abcd");
    expect(maskKey("abc")).toBe("••••");
  });

  it("validateKey accepts a 200 response", async () => {
    const fakeFetch = (async () =>
      new Response("{}", { status: 200 })) as unknown as typeof fetch;
    await expect(validateKey("k", fakeFetch)).resolves.toBe(true);
  });

  it("validateKey rejects a 401 response", async () => {
    const fakeFetch = (async () =>
      new Response("{}", { status: 401 })) as unknown as typeof fetch;
    await expect(validateKey("k", fakeFetch)).resolves.toBe(false);
  });

  it("validateKey rejects a network error", async () => {
    const fakeFetch = (async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    await expect(validateKey("k", fakeFetch)).resolves.toBe(false);
  });
});
