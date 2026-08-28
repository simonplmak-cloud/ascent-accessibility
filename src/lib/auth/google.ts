import { createPublicKey, verify as cryptoVerify, type KeyObject } from "node:crypto";
import { logger } from "@/lib/observability/logger";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

function b64urlDecode(data: string): Buffer {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

interface JwtHeader {
  alg?: string;
  kid?: string;
}

interface JwtPayload {
  iss?: string;
  aud?: string;
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

// Verify a Google ID token locally: fetch Google's JWKS, verify the RS256
// signature, and validate iss/aud/exp. Replaces the deprecated `tokeninfo`
// endpoint (which is now development/debugging only).
export async function verifyGoogleIdToken(
  idToken: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleIdentity | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    logger.warn("google-verify: GOOGLE_CLIENT_ID is not set");
    return null;
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    logger.warn("google-verify: malformed token");
    return null;
  }
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  let header: JwtHeader;
  let payload: JwtPayload;
  try {
    header = JSON.parse(b64urlDecode(headerB64).toString("utf8")) as JwtHeader;
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8")) as JwtPayload;
  } catch {
    logger.warn("google-verify: token decode failed");
    return null;
  }

  if (header.alg !== "RS256" || !header.kid) {
    logger.warn({ alg: header.alg }, "google-verify: unsupported alg");
    return null;
  }

  // Cheap fail-fast claim validation before any network round-trip.
  if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
    logger.warn({ iss: payload.iss }, "google-verify: unexpected issuer");
    return null;
  }
  if (payload.aud !== clientId) {
    logger.warn("google-verify: audience mismatch");
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    logger.warn("google-verify: token expired");
    return null;
  }

  // Fetch Google's JWKS and verify the signature.
  let jwk: Record<string, unknown> | undefined;
  try {
    const res = await fetchFn(GOOGLE_JWKS_URL);
    if (!res.ok) throw new Error(`JWKS HTTP ${res.status}`);
    const { keys } = (await res.json()) as { keys: Record<string, unknown>[] };
    jwk = keys.find((k) => k.kid === header.kid);
  } catch (error) {
    logger.warn({ error }, "google-verify: JWKS fetch failed");
    return null;
  }
  if (!jwk) {
    logger.warn({ kid: header.kid }, "google-verify: signing key not found");
    return null;
  }

  let key: KeyObject;
  try {
    key = createPublicKey({ key: jwk, format: "jwk" });
  } catch (error) {
    logger.warn({ error }, "google-verify: key parse failed");
    return null;
  }

  const data = Buffer.from(`${headerB64}.${payloadB64}`);
  let valid = false;
  try {
    valid = cryptoVerify("sha256", data, key, b64urlDecode(sigB64));
  } catch {
    valid = false;
  }
  if (!valid) {
    logger.warn("google-verify: signature invalid");
    return null;
  }

  if (!payload.sub || !payload.email) {
    logger.warn("google-verify: token missing sub or email");
    return null;
  }
  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}
