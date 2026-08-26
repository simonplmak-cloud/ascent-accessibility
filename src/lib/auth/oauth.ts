import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

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
  name?: string;
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
