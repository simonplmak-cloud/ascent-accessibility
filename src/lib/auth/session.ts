import type { Surreal } from "surrealdb";

export const SESSION_COOKIE = "wcag_session";
export const ACCESS_METHOD = "user";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthConfig {
  namespace: string;
  database: string;
}

export interface AuthInput {
  name?: string;
  email: string;
  password: string;
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

export async function signUpWithPassword(
  db: Surreal,
  cfg: AuthConfig,
  input: AuthInput,
): Promise<AuthResult> {
  try {
    const tokens = await db.signup({
      namespace: cfg.namespace,
      database: cfg.database,
      access: ACCESS_METHOD,
      variables: {
        name: input.name ?? input.email.split("@")[0] ?? "",
        email: input.email,
        password: input.password,
      },
    });
    const token = extractToken(tokens);
    if (!token) return { ok: false, error: "Sign-up failed. Please try again." };
    return { ok: true, token };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/already contains|duplicate|already exists/i.test(message)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    return { ok: false, error: "Sign-up failed. Please try again." };
  }
}

export async function signInWithPassword(
  db: Surreal,
  cfg: AuthConfig,
  input: AuthInput,
): Promise<AuthResult> {
  try {
    const tokens = await db.signin({
      namespace: cfg.namespace,
      database: cfg.database,
      access: ACCESS_METHOD,
      variables: { email: input.email, password: input.password },
    });
    const token = extractToken(tokens);
    if (!token) return { ok: false, error: "Invalid email or password." };
    return { ok: true, token };
  } catch {
    return { ok: false, error: "Invalid email or password." };
  }
}

export async function verifySessionToken(
  db: Surreal,
  token: string,
): Promise<SessionUser | null> {
  try {
    await db.authenticate(token);
    const results = await db
      .query("SELECT id, email, name FROM user WHERE id = $auth.id LIMIT 1")
      .json()
      .collect();
    const rows = (results as unknown[])[0] as Array<Record<string, unknown>> | undefined;
    const record = rows?.[0];
    if (!record?.id) return null;
    return {
      id: String(record.id),
      email: typeof record.email === "string" ? record.email : "",
      name: typeof record.name === "string" ? record.name : "",
    };
  } catch {
    return null;
  }
}
