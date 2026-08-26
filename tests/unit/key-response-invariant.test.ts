import { beforeAll, describe, expect, it, vi } from "vitest";
import { encryptKey } from "@/server/byok";

// Shared between the hoisted mock factories and the test body.
const h = vi.hoisted(() => ({ storedBlob: "" }));

vi.mock("@/server/auth", () => ({
  getSessionUser: async () => ({
    id: "user:1",
    name: "Test",
    role: null,
    email: "test@example.com",
  }),
}));

vi.mock("@/db", () => ({
  query: vi.fn(async (sql: string) => {
    if (/SELECT aiBalanceCents/.test(sql)) {
      return [{ aiBalanceCents: 1000, openrouterKeyHash: null, aiKeyKind: null }];
    }
    if (/SELECT aiApiKey, aiProvider/.test(sql)) {
      return [{ aiApiKey: h.storedBlob, aiProvider: "openrouter" }];
    }
    return [];
  }),
}));

vi.mock("@/server/openrouter-admin", () => ({
  createOpenRouterKey: async () => ({
    hash: "hash123",
    key: "sk-or-v1-PROVISION_SECRET_AAAABBBB",
    limitUsd: 10,
    limitRemainingUsd: 10,
  }),
  updateOpenRouterKey: async () => {},
}));

vi.mock("@/lib/ai-review/factory", () => ({
  validateProviderKey: async () => true,
}));

import { POST as provisionPost } from "@/app/api/account/ai-provision/route";
import { GET as aiKeyGet, POST as aiKeyPost } from "@/app/api/account/ai-key/route";

beforeAll(() => {
  process.env.BYOK_ENCRYPTION_SECRET = "test-secret";
  h.storedBlob = JSON.stringify(encryptKey("sk-STORED_EEEEFFFF"));
});

describe("key-response invariant — no plaintext leak", () => {
  it("provision response masks the key", async () => {
    const res = await provisionPost();
    const text = await res.text();
    expect(text).not.toContain("PROVISION_SECRET_AAAABBBB");
    expect(text).toContain("••••BBBB");
  });

  it("BYOK save response masks the key", async () => {
    const res = await aiKeyPost(
      new Request("http://x/api/account/ai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "sk-BYOK_SECRET_CCCCDDDD", provider: "openrouter" }),
      }),
    );
    const text = await res.text();
    expect(text).not.toContain("BYOK_SECRET_CCCCDDDD");
    expect(text).toContain("••••DDDD");
  });

  it("BYOK get response masks the stored key", async () => {
    const res = await aiKeyGet();
    const text = await res.text();
    expect(text).not.toContain("STORED_EEEEFFFF");
    expect(text).toContain("••••FFFF");
  });
});
