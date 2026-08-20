// Ad-hoc output-quality audit: signs in, runs N site-scope assessments, and
// dumps a compact summary (conformance + findings) for inspection.
// Usage: pnpm tsx scripts/quality-audit.ts

const BASE = process.env.AUDIT_BASE_URL ?? "https://accessibility.ascent.partners";

const DEFAULT_SITES = [
  "https://example.com",
  "https://www.ascent.partners",
  "https://dialogue-experience.hk",
  "https://www.a11yproject.com",
  "https://www.gov.hk",
];

const SITES = (process.env.AUDIT_SITES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const AUDIT_SCOPE = process.env.AUDIT_SCOPE ?? "site";

interface MailtmInbox {
  address: string;
  password: string;
  token: string;
}

async function createMailtmInbox(): Promise<MailtmInbox> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const address = `e2e-${suffix}@emalupe.com`;
  const password = `e2e-pass-${suffix}`;
  const acct = await fetch("https://api.mail.tm/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!acct.ok) throw new Error(`mail.tm account: ${acct.status}`);
  const tok = await fetch("https://api.mail.tm/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  const tokenData = (await tok.json()) as { token: string };
  return { address, password, token: tokenData.token };
}

async function waitForMagicLink(inbox: MailtmInbox, timeoutMs = 90_000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: `Bearer ${inbox.token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { "hydra:member": Array<{ id: string }> };
      const msgs = data["hydra:member"] ?? [];
      if (msgs.length > 0) {
        const m = await fetch(`https://api.mail.tm/messages/${msgs[0]!.id}`, {
          headers: { Authorization: `Bearer ${inbox.token}` },
        });
        const body = (await m.json()) as { text?: string; html?: string | string[] };
        const raw = body.text ?? (Array.isArray(body.html) ? body.html.join("") : body.html ?? "");
        const link = raw.match(/https?:\/\/[^\s"'>]+/);
        if (link) return link[0];
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("no magic link received");
}

async function signIn(): Promise<string> {
  const inbox = await createMailtmInbox();
  await fetch(`${BASE}/api/auth/magic-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: inbox.address }),
  });
  const link = await waitForMagicLink(inbox);
  const res = await fetch(link, { redirect: "manual" });
  const cookie = res.headers.getSetCookie?.().find((c) => c.startsWith("wcag_session="));
  if (!cookie) throw new Error("no session cookie set");
  return cookie.split(";")[0]!;
}

async function submitAssessment(cookie: string, url: string, pageCap?: number): Promise<string> {
  const res = await fetch(`${BASE}/api/v1/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ url, standard: "wcag22aa", scope: AUDIT_SCOPE, ...(pageCap ? { pageCap } : {}) }),
  });
  const body = (await res.json()) as { id?: string; code?: string };
  if (res.status !== 202 || !body.id) {
    throw new Error(`submit ${url}: HTTP ${res.status} ${JSON.stringify(body)}`);
  }
  return body.id;
}

async function poll(id: string, timeoutMs = 600_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/v1/assessments/${id}`);
      if (res.ok) {
        const body = (await res.json()) as { status: string };
        if (body.status === "completed" || body.status === "failed") return body.status;
      }
    } catch {
      /* transient — retry */
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  return "timeout";
}

async function main() {
  const sites = SITES.length > 0 ? SITES : DEFAULT_SITES;
  // Sequential (one crawl at a time) to avoid overwhelming the co-located
  // Browserless. Two accounts because the site-scope daily limit is 3/account.
  const cookieA = await signIn();
  console.log("account A signed in");
  const cookieB = await signIn();
  console.log("account B signed in");

  for (let i = 0; i < sites.length; i++) {
    const cookie = i < 3 ? cookieA : cookieB;
    const url = sites[i]!;
    // gov.hk is huge — cap the crawl so it finishes in reasonable time.
    const pageCap = AUDIT_SCOPE === "site" && url.includes("gov.hk") ? 10 : undefined;
    console.log(`\n>>> submitting ${url} ...`);
    const id = await submitAssessment(cookie, url, pageCap);
    const status = await poll(id);
    const res = await fetch(`${BASE}/api/v1/assessments/${id}`);
    const a = (await res.json()) as Record<string, unknown>;
    const findings = (a.findings ?? []) as Array<Record<string, unknown>>;
    console.log("=".repeat(70));
    console.log(`URL: ${url}`);
    console.log(
      `status=${a.status} conformance=${a.conformance} scsMet=${a.scsMet} scsApplicable=${a.scsApplicable} pages=${a.pagesScanned}`,
    );
    console.log(`findings: ${findings.length}`);
    for (const f of findings) {
      const scs = (f.wcagSc as string[] | undefined)?.join(",") || "(none)";
      const rec = String(f.recommendation ?? "").slice(0, 110);
      console.log(`  [${f.impact}] ${f.ruleId} -> ${scs}`);
      console.log(`    rec: ${rec}`);
    }
  }
  console.log("\ndone");
}

main().catch((e) => {
  console.error("audit failed:", e);
  process.exit(1);
});
