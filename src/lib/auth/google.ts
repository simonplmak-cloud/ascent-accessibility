import { randomBytes } from "node:crypto";
import type { Surreal } from "surrealdb";
import { query } from "@/db";
import { logger } from "@/lib/observability/logger";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export interface AuthConfig {
  namespace: string;
  database: string;
}

export interface AuthResult {
  ok: boolean;
  token?: string;
  error?: string;
}

function extractToken(result: unknown): string | null {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    if (typeof r.access === "string") return r.access;
    if (typeof r.token === "string") return r.token;
  }
  return null;
}

// Verifies a Google ID token via Google's tokeninfo endpoint and checks the
// audience. No OAuth library dependency.
export async function verifyGoogleToken(
  credential: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleIdentity | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    logger.warn("google-verify: GOOGLE_CLIENT_ID is not set");
    return null;
  }
  try {
    const res = await fetchFn(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!res.ok) {
      logger.warn({ status: res.status }, "google-verify: tokeninfo request failed");
      return null;
    }
    const data = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
    };
    logger.info(
      {
        audMatch: data.aud === clientId,
        audPrefix: data.aud ? `${data.aud.slice(0, 12)}…` : undefined,
        clientPrefix: `${clientId.slice(0, 12)}…`,
      },
      "google-verify: tokeninfo response",
    );
    if (data.aud !== clientId) {
      logger.warn("google-verify: audience mismatch");
      return null;
    }
    if (!data.sub || !data.email) {
      logger.warn("google-verify: token missing sub or email");
      return null;
    }
    return {
      sub: data.sub,
      email: data.email,
      emailVerified: data.email_verified === true || data.email_verified === "true",
      name: typeof data.name === "string" ? data.name : undefined,
    };
  } catch (error) {
    logger.warn({ err: error }, "google-verify: verification threw");
    return null;
  }
}

// Signs a Google identity in: sign-in by googleSub, else link to an existing
// password account with the same email, else sign up as a new user.
export async function signInWithGoogle(
  db: Surreal,
  cfg: AuthConfig,
  identity: GoogleIdentity,
): Promise<AuthResult> {
  // 1. Sign in by googleSub (already-linked account).
  try {
    const signin = await db.signin({
      namespace: cfg.namespace,
      database: cfg.database,
      access: "user_google",
      variables: { googleSub: identity.sub },
    });
    const token = extractToken(signin);
    if (token) return { ok: true, token };
  } catch {
    /* user not found — fall through */
  }

  // 2. Link the Google identity to an existing password account (same email).
  const existing = await query("SELECT id FROM user WHERE email = $email LIMIT 1", {
    email: identity.email,
  });
  if (existing.length > 0) {
    await query("UPDATE user SET googleSub = $sub, verified = true WHERE email = $email", {
      sub: identity.sub,
      email: identity.email,
    });
    try {
      const signin = await db.signin({
        namespace: cfg.namespace,
        database: cfg.database,
        access: "user_google",
        variables: { googleSub: identity.sub },
      });
      const token = extractToken(signin);
      if (token) return { ok: true, token };
    } catch (error) {
      logger.warn({ error }, "google-signin: re-signin after link failed");
    }
    return { ok: false, error: "Sign-in failed. Please try again." };
  }

  // 3. Brand-new Google user → sign up.
  try {
    const signup = await db.signup({
      namespace: cfg.namespace,
      database: cfg.database,
      access: "user_google",
      variables: {
        name: identity.name ?? identity.email.split("@")[0] ?? "",
        email: identity.email,
        password: randomBytes(32).toString("hex"),
        googleSub: identity.sub,
      },
    });
    const token = extractToken(signup);
    if (!token) return { ok: false, error: "Sign-in failed. Please try again." };
    return { ok: true, token };
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      "google-signin: signup failed",
    );
    return { ok: false, error: "Sign-in failed. Please try again." };
  }
}
