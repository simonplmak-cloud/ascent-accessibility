import { beforeAll, describe, expect, it } from "vitest";
import { issueSession, verifySession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

describe("session (HMAC-JWT)", () => {
  it("round-trips the account id", () => {
    const token = issueSession("user:abc123");
    expect(verifySession(token)).toEqual({ userId: "user:abc123" });
  });

  it("rejects a tampered signature", () => {
    const token = issueSession("user:abc123");
    const parts = token.split(".");
    const forged = `${parts[0]}.${parts[1]}.${"a".repeat(43)}`;
    expect(verifySession(forged)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifySession("not-a-jwt")).toBeNull();
    expect(verifySession("a.b.c.d")).toBeNull();
  });

  it("rejects an expired token", () => {
    const secret = process.env.SESSION_SECRET;
    const { createHmac } = require("node:crypto") as typeof import("node:crypto");
    const b64 = (s: string) => Buffer.from(s).toString("base64url");
    const now = Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS - 10;
    const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = b64(JSON.stringify({ sub: "user:abc123", iat: now - 100, exp: now }));
    const sig = createHmac("sha256", secret!).update(`${header}.${body}`).digest("base64url");
    expect(verifySession(`${header}.${body}.${sig}`)).toBeNull();
  });
});
