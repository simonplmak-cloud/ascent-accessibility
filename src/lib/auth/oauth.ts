import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { verifyGoogleIdToken } from "./google";

function b64urlDecode(data: string): Buffer {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function stateSecret(): string {
  return process.env.OAUTH_STATE_SECRET ?? process.env.BYOK_ENCRYPTION_SECRET ?? "dev-secret";
}

// Stateless, signed OAuth state. Carries the redirect target (`next`) plus a
// nonce, HMAC-signed so the callback can verify it without a cookie round-trip.
export function createOauthState(next: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = Buffer.from(JSON.stringify({ n: nonce, next })).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOauthState(state: string): { next: string } | null {
  const parts = state.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts as [string, string];
  const expected = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      next?: unknown;
    };
    const next =
      typeof data.next === "string" && data.next.startsWith("/") && !data.next.startsWith("//")
        ? data.next
        : "/assess";
    return { next };
  } catch {
    return null;
  }
}

export interface OAuthIdentity {
  provider: string; // "github" | "microsoft" | ...
  subject: string; // provider-specific user id
  email: string;
  name?: string | undefined;
  verified: boolean;
}

export interface OAuthProvider {
  id: string;
  authorizeUrl(redirectUri: string, state: string): string;
  exchange(code: string, redirectUri: string, fetchFn?: typeof fetch): Promise<OAuthIdentity>;
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
      scope: "openid profile email User.Read",
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
    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
      error?: string;
    };
    if (!tokenData.access_token) {
      throw new Error(`microsoft: token exchange failed (${tokenData.error ?? "no access_token"})`);
    }

    // Stable subject + fallback email from the ID token. Microsoft's `oid` is
    // the correct stable subject; `email`/`preferred_username` keep the flow
    // working even without Graph. Graph `mail` is authoritative (verified) when
    // the `User.Read` scope is granted, but is best-effort.
    let oid = "";
    let tid = "";
    let email = "";
    let name = "";
    if (tokenData.id_token) {
      try {
        const id = JSON.parse(
          b64urlDecode(tokenData.id_token.split(".")[1] ?? "").toString("utf8"),
        ) as {
          oid?: string;
          tid?: string;
          email?: string;
          preferred_username?: string;
          name?: string;
        };
        oid = id.oid ?? "";
        tid = id.tid ?? "";
        email = id.email ?? id.preferred_username ?? "";
        name = id.name ?? "";
      } catch {
        /* id_token parse best-effort */
      }
    }

    try {
      const meRes = await fetchFn("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as {
          id?: string;
          displayName?: string;
          mail?: string | null;
          userPrincipalName?: string;
        };
        oid = oid || me.id || "";
        email = me.mail ?? me.userPrincipalName ?? email;
        name = me.displayName ?? name;
      }
    } catch {
      /* Graph best-effort */
    }

    if (!oid || !email) {
      throw new Error("microsoft: no usable identity (missing oid or email)");
    }
    return {
      provider: "microsoft",
      subject: tid ? `${tid}|${oid}` : oid,
      email,
      name,
      verified: true,
    };
  },
};

const googleProvider: OAuthProvider = {
  id: "google",
  authorizeUrl(redirectUri, state) {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: redirectUri,
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },
  async exchange(code, redirectUri, fetchFn = fetch) {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
    const tokenRes = await fetchFn("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) throw new Error(`google: token exchange failed (${tokenRes.status})`);
    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) throw new Error("google: no id_token");
    const identity = await verifyGoogleIdToken(tokenData.id_token, fetchFn);
    if (!identity) throw new Error("google: id_token verification failed");
    return {
      provider: "google",
      subject: identity.sub,
      email: identity.email,
      name: identity.name,
      verified: identity.emailVerified,
    };
  },
};

export const providers: Record<string, OAuthProvider> = {
  github: githubProvider,
  google: googleProvider,
  microsoft: microsoftProvider,
};
