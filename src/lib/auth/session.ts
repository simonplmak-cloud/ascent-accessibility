import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_MAX_AGE_SECONDS } from "./constants";

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, type SessionUser } from "./constants";

function secret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function b64url(data: string): string {
  return Buffer.from(data).toString("base64url");
}

// Own HMAC-JWT session (replaces SurrealDB record-access sessions).
export function issueSession(userId: string): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(
    JSON.stringify({ sub: userId, iat: now, exp: now + SESSION_MAX_AGE_SECONDS }),
  );
  return `${header}.${body}.${sign(`${header}.${body}`)}`;
}

export function verifySession(token: string): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts as [string, string, string];
  const expected = sign(`${header}.${body}`);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}
