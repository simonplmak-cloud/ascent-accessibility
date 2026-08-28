# OAuth setup — point sign-in providers at the new domain

After the domain rename, each OAuth provider must allowlist the new domain
(`accessibility.ascent.partners`) or sign-in will fail at the redirect/callback
step. These are **existing** production apps — update them, don't recreate.

The client IDs below are what the deployed app currently uses, so you can
confirm you're editing the right app in each console.

| Provider | Client ID | What to change |
|---|---|---|
| GitHub OAuth App | `Ov23lip4sUglz6zeoPBo` | Authorization callback URL + Homepage URL |
| Microsoft Entra app | `8bd51f98-60a7-49bc-82d2-94e414878ab3` | Web redirect URI |
| Google OAuth client | the value of `GOOGLE_CLIENT_ID` (Vercel) | Authorized redirect URI + Client secret |

---

## Required environment variables (Vercel)

These must be set for the login flows to work. The Google client is now the
**server-side authorization-code flow** (no client-side `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth web client ID (audience for ID-token verification) |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret (code exchange) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | ✅ (if GitHub) | |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | ✅ (if Microsoft) | |
| `SESSION_SECRET` | ✅ | Signs the session JWT **and the stateless magic-link token** — must be a strong secret |
| `OAUTH_STATE_SECRET` | ✅ | Signs the OAuth `state` (falls back to `BYOK_ENCRYPTION_SECRET`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://accessibility.ascent.partners` — used to build the `redirect_uri` |
| `BYOK_ENCRYPTION_SECRET` | ✅ (if BYOK AI) | Also the OAuth-state fallback |

---

## 1. GitHub

1. Go to **https://github.com/settings/developers** → **OAuth Apps**.
2. Open the app whose **Client ID** is `Ov23lip4sUglz6zeoPBo`.
3. **Authorization callback URL** — replace the old domain with:
   ```
   https://accessibility.ascent.partners/api/auth/oauth/github/callback
   ```
   (You can leave the old `wcag-score.ascent.partners` URL as a second entry during
   transition, then remove it once the new one is verified.)
4. **Homepage URL** → `https://accessibility.ascent.partners`.
5. **Update application**.

Do **not** change the Client Secret. The app already requests scope `user:email` —
that's what the code needs; leave scopes alone.

## 2. Microsoft (Entra / Azure AD)

1. Go to **https://portal.azure.com** → **Microsoft Entra ID** → **App registrations** → **All applications**.
2. Open the app whose **Application (client) ID** is `71823f83-06ff-432b-bf95-359b865c21dc`.
3. **Authentication** (left menu) → under **Web**, **Redirect URIs** → add:
   ```
   https://accessibility.ascent.partners/api/auth/oauth/microsoft/callback
   ```
4. **Save**. Leave the old URI in place during transition if you like, then remove it.

The code uses `scope=openid profile email` and `login.microsoftonline.com/common` —
no change needed there.

## 3. Google (OAuth 2.0 web application — authorization-code flow)

Google now uses the **same server-side authorization-code flow** as GitHub and
Microsoft (`/api/auth/oauth/google` → redirect → callback), not the client-side
Google Identity Services button.

1. Go to **https://console.cloud.google.com** → **APIs & Services** → **Credentials**.
2. Open the **OAuth 2.0 Client ID** configured for this app (its ID is the value of
   `GOOGLE_CLIENT_ID` in Vercel — the previous JavaScript-origin client is no longer used).
3. Under **Authorized redirect URIs** → add:
   ```
   https://accessibility.ascent.partners/api/auth/oauth/google/callback
   ```
4. Note the **Client secret** and set `GOOGLE_CLIENT_SECRET` in Vercel.
5. **Save**.

The server exchanges the authorization code for tokens and verifies the Google ID
token locally (JWKS) — the audience (`aud`) is checked against `GOOGLE_CLIENT_ID`.
There is no client-side `NEXT_PUBLIC_GOOGLE_CLIENT_ID` anymore.

---

## Verify

Automated checks already pass against production (no provider login required):

```bash
cs run "PLAYWRIGHT_BASE_URL=https://accessibility.ascent.partners E2E_LIVE=1 npx playwright test tests/e2e/domain.spec.ts tests/e2e/auth-redirects.spec.ts"
```

Then do a **one-time manual sign-in** for each provider (or the Playwright-assisted
run): click "Sign in with GitHub / Microsoft / Google" on
`https://accessibility.ascent.partners/sign-in`, complete the provider login, and
confirm you land on `/site` signed in. If a provider errors at the callback (e.g.
`redirect_uri_mismatch`), its allowlist above isn't set correctly yet.
