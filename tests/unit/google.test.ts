import { beforeAll, describe, expect, it } from "vitest";
import {
  generateKeyPairSync,
  sign as cryptoSign,
  type KeyObject,
} from "node:crypto";
import { verifyGoogleIdToken } from "@/lib/auth/google";

let privateKey: KeyObject;
let jwks: { keys: unknown[] };

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = "client-123";
  const { privateKey: priv, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  privateKey = priv;
  const jwk = publicKey.export({ format: "jwk" });
  jwks = { keys: [{ ...jwk, kid: "test-key", alg: "RS256", use: "sig" }] };
});

function b64url(data: Buffer | string): string {
  return Buffer.from(data).toString("base64url");
}

function makeToken(payload: Record<string, unknown>, kid = "test-key"): string {
  const header = b64url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = cryptoSign("sha256", Buffer.from(`${header}.${body}`), privateKey);
  return `${header}.${body}.${b64url(sig)}`;
}

function jsonResponse(body: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
}

const basePayload = {
  iss: "accounts.google.com",
  aud: "client-123",
  exp: Math.floor(Date.now() / 1000) + 3600,
  sub: "s1",
  email: "a@b.example",
  email_verified: true,
  name: "Ada",
};

describe("verifyGoogleIdToken", () => {
  it("verifies a valid token", async () => {
    const identity = await verifyGoogleIdToken(makeToken(basePayload), jsonResponse(jwks));
    expect(identity?.sub).toBe("s1");
    expect(identity?.email).toBe("a@b.example");
    expect(identity?.emailVerified).toBe(true);
  });

  it("rejects a wrong audience", async () => {
    const token = makeToken({ ...basePayload, aud: "other" });
    expect(await verifyGoogleIdToken(token, jsonResponse(jwks))).toBeNull();
  });

  it("rejects a wrong issuer", async () => {
    const token = makeToken({ ...basePayload, iss: "evil.example" });
    expect(await verifyGoogleIdToken(token, jsonResponse(jwks))).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = makeToken({ ...basePayload, exp: Math.floor(Date.now() / 1000) - 10 });
    expect(await verifyGoogleIdToken(token, jsonResponse(jwks))).toBeNull();
  });

  it("rejects a token missing sub or email", async () => {
    const { sub: _sub, email: _email, ...rest } = basePayload;
    const token = makeToken(rest);
    expect(await verifyGoogleIdToken(token, jsonResponse(jwks))).toBeNull();
  });

  it("rejects an unknown kid", async () => {
    const token = makeToken(basePayload, "unknown-key");
    expect(await verifyGoogleIdToken(token, jsonResponse(jwks))).toBeNull();
  });

  it("rejects on a JWKS fetch failure", async () => {
    const failing = (async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    expect(await verifyGoogleIdToken(makeToken(basePayload), failing)).toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const token = makeToken(basePayload);
    const [h, p] = token.split(".");
    const bad = `${h}.${p}.${b64url("tampered")}`;
    expect(await verifyGoogleIdToken(bad, jsonResponse(jwks))).toBeNull();
  });
});
