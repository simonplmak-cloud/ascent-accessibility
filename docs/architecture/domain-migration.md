# Domain migration — production checklist

Rename `wcag-score.ascent.partners` → `accessibility.ascent.partners`.

> **Status (checked live 2026-08-20):** the new domain serves correctly on Vercel,
> but `NEXT_PUBLIC_SITE_URL` was still set to the old domain in the Vercel
> environment, so every generated URL (OAuth callbacks, magic-link email, Stripe
> `return_url`, canonical/`og:url`, `sitemap.xml`, `robots.txt`) pointed at the
> dead domain. The old domain returns Vercel `404 DEPLOYMENT_NOT_FOUND`.

Code fallbacks were already on the new domain and are now centralized in
`src/lib/site/site-url.ts` (`SITE_URL` / `getSiteUrl()`). The remaining work is
**external configuration** — none of it can be done from the repo.

---

## 1. Vercel (blocking)

1. Project → Settings → Environment Variables → set
   `NEXT_PUBLIC_SITE_URL = https://accessibility.ascent.partners`.
2. **Redeploy** (required, not optional): `NEXT_PUBLIC_*` values are inlined at
   build time, so an env change alone does nothing until a new build runs.
3. Domains → confirm `accessibility.ascent.partners` is assigned and the DNS
   record exists (verified live: resolves to Vercel and returns `200`).
4. Domains → `wcag-score.ascent.partners` is still CNAME'd to
   `cname.vercel-dns.com` but unassigned (404). Either assign it to this project
   with a redirect, or remove it and add a redirect rule in `next.config.mjs`.

### Verification (after redeploy)

```bash
curl -s https://accessibility.ascent.partners/api/auth/oauth/github -o /dev/null -D - \
  | grep -i location   # redirect_uri must be https://accessibility.ascent.partners/...
curl -s https://accessibility.ascent.partners/robots.txt
curl -s https://accessibility.ascent.partners/sitemap.xml | head -c 400
curl -s https://accessibility.ascent.partners/ | grep -oiE 'rel="canonical"[^>]*|og:url[^>]*'
```

All four must show `accessibility.ascent.partners`, not `wcag-score.ascent.partners`.

---

## 2. OAuth providers (blocking for sign-in)

Update the callback/origin allowlist in each provider's developer console to the
new domain, otherwise sign-in redirects to the dead domain and 404s.

| Provider | Setting | Value |
|---|---|---|
| GitHub OAuth App | Authorization callback URL | `https://accessibility.ascent.partners/api/auth/oauth/github/callback` |
| Microsoft Entra (Azure AD) | Redirect URI (Web) | `https://accessibility.ascent.partners/api/auth/oauth/microsoft/callback` |
| Google OAuth client | Authorized JavaScript origins | `https://accessibility.ascent.partners` |

Related env vars (unchanged, just confirm the client IDs match the apps above):
`GITHUB_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID`,
`NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

---

## 3. Resend (email)

- `RESEND_FROM` currently defaults to `Ascent Accessibility <onboarding@resend.dev>`
  (test-only). Verify a production sending domain in the Resend dashboard and set
  `RESEND_FROM` to an address on it.
- Magic-link URL is generated from `NEXT_PUBLIC_SITE_URL` (fixed by step 1).

---

## 4. Stripe

- Embedded-checkout `return_url` is generated from `NEXT_PUBLIC_SITE_URL`
  (fixed by step 1) — no separate config.
- **Gap:** `STRIPE_WEBHOOK_SECRET` is listed as required, but **no webhook route
  exists in the codebase** (`src/app/api/` has no Stripe webhook handler). If
  subscription status sync is expected, a webhook endpoint + Stripe dashboard
  endpoint URL must be added before production.

---

## 5. Search / SEO

- Google Search Console: add the new domain property and resubmit `sitemap.xml`.
- The sitemap/robots are generated from `NEXT_PUBLIC_SITE_URL` (fixed by step 1).

---

## 6. Optional redirects (old → new)

Add to `next.config.mjs` `redirects()` (or Vercel `vercel.json`) so bookmarks and
crawlers hitting the old host are 301'd instead of 404:

```ts
async redirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: "wcag-score.ascent.partners" }],
      destination: "https://accessibility.ascent.partners/:path*",
      permanent: true,
    },
  ];
}
```

---

## Non-blocking cleanup (separate pass)

- `README.md` is stale (PostgreSQL / QStash / Clerk / Drizzle — none are used).
- Stray `/.tmp-qsub.mjs` at repo root (touches the live DB).
- Deprecated `fly.toml` and `browserless/fly.toml` (both Fly apps are stopped; moved to `deploy/deprecated/`).
