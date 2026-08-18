import { randomBytes } from "node:crypto";
import type { Surreal } from "surrealdb";

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
  if (!clientId) return null;
  try {
    const res = await fetchFn(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
    };
    if (data.aud !== clientId) return null;
    if (!data.sub || !data.email) return null;
    return {
      sub: data.sub,
      email: data.email,
      emailVerified: data.email_verified === true || data.email_verified === "true",
      name: typeof data.name === "string" ? data.name : undefined,
    };
  } catch {
    return null;
  }
}

// Signs a Google identity in: sign-in by googleSub, else sign-up (find-or-create).
export async function signInWithGoogle(
  db: Surreal,
  cfg: AuthConfig,
  identity: GoogleIdentity,
): Promise<AuthResult> {
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
    /* user not found — fall through to signup */
  }

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
  } catch {
    return { ok: false, error: "Sign-in failed. Please try again." };
  }
}
