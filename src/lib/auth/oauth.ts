import { randomBytes } from "node:crypto";
import type { Surreal } from "surrealdb";
import { query } from "@/db";
import { logger } from "@/lib/observability/logger";

export interface OAuthIdentity {
  provider: string; // "github" | "microsoft" | ...
  subject: string; // provider-specific user id
  email: string;
  name?: string;
  verified: boolean;
}

export interface OAuthProvider {
  id: string;
  authorizeUrl(redirectUri: string, state: string): string;
  exchange(code: string, redirectUri: string, fetchFn?: typeof fetch): Promise<OAuthIdentity>;
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

// Signs an OAuth identity in via the generic `user_oauth` access method. The
// subject is namespaced by provider so one field serves every provider.
export async function signInWithOAuth(
  db: Surreal,
  cfg: AuthConfig,
  identity: OAuthIdentity,
): Promise<AuthResult> {
  const oauthSubject = `${identity.provider}:${identity.subject}`;

  // 1. Sign in by oauthSubject (already-linked account).
  try {
    const signin = await db.signin({
      namespace: cfg.namespace,
      database: cfg.database,
      access: "user_oauth",
      variables: { oauthSubject },
    });
    const token = extractToken(signin);
    if (token) return { ok: true, token };
  } catch {
    /* not linked yet — fall through */
  }

  // 2. Link to an existing password account with the same email.
  const existing = await query("SELECT id FROM user WHERE email = $email LIMIT 1", {
    email: identity.email,
  });
  if (existing.length > 0) {
    await query("UPDATE user SET oauthSubject = $sub, verified = true WHERE email = $email", {
      sub: oauthSubject,
      email: identity.email,
    });
    try {
      const signin = await db.signin({
        namespace: cfg.namespace,
        database: cfg.database,
        access: "user_oauth",
        variables: { oauthSubject },
      });
      const token = extractToken(signin);
      if (token) return { ok: true, token };
    } catch (error) {
      logger.warn({ error }, "oauth: re-signin after link failed");
    }
    return { ok: false, error: "Sign-in failed. Please try again." };
  }

  // 3. Brand-new OAuth user → sign up.
  try {
    const signup = await db.signup({
      namespace: cfg.namespace,
      database: cfg.database,
      access: "user_oauth",
      variables: {
        name: identity.name ?? identity.email.split("@")[0] ?? "",
        email: identity.email,
        password: randomBytes(32).toString("hex"),
        oauthSubject,
      },
    });
    const token = extractToken(signup);
    if (!token) return { ok: false, error: "Sign-in failed. Please try again." };
    return { ok: true, token };
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      "oauth: signup failed",
    );
    return { ok: false, error: "Sign-in failed. Please try again." };
  }
}

// --- Providers (authorization-code flow) ---

const githubProvider: OAuthProvider = {
  id: "github",
  authorizeUrl(redirectUri, state) {
    const clientId = process.env.GITHUB_CLIENT_ID ?? "";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },
  async exchange(code, redirectUri, fetchFn = fetch) {
    const clientId = process.env.GITHUB_CLIENT_ID ?? "";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
    const tokenRes = await fetchFn("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) throw new Error("github: no access token");

    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "wcag-score",
      Accept: "application/json",
    };
    const [userRes, emailsRes] = await Promise.all([
      fetchFn("https://api.github.com/user", { headers }),
      fetchFn("https://api.github.com/user/emails", { headers }),
    ]);
    const user = (await userRes.json()) as { id?: number; login?: string; name?: string | null };
    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary?: boolean;
      verified?: boolean;
    }>;
    const email =
      emails.find((e) => e.primary && e.verified) ??
      emails.find((e) => e.verified) ??
      emails[0];
    if (!user.id || !email?.email) throw new Error("github: no email");
    return {
      provider: "github",
      subject: String(user.id),
      email: email.email,
      name: user.name ?? user.login,
      verified: true,
    };
  },
};

const microsoftProvider: OAuthProvider = {
  id: "microsoft",
  authorizeUrl(redirectUri, state) {
    const clientId = process.env.MICROSOFT_CLIENT_ID ?? "";
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "openid profile email",
      state,
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  },
  async exchange(code, redirectUri, fetchFn = fetch) {
    const clientId = process.env.MICROSOFT_CLIENT_ID ?? "";
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET ?? "";
    const tokenRes = await fetchFn("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) throw new Error("microsoft: no access token");

    const meRes = await fetchFn("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = (await meRes.json()) as {
      id?: string;
      displayName?: string;
      mail?: string | null;
      userPrincipalName?: string;
    };
    const email = me.mail ?? me.userPrincipalName;
    if (!me.id || !email) throw new Error("microsoft: no email");
    return {
      provider: "microsoft",
      subject: me.id,
      email,
      name: me.displayName,
      verified: true,
    };
  },
};

export const providers: Record<string, OAuthProvider> = {
  github: githubProvider,
  microsoft: microsoftProvider,
};
