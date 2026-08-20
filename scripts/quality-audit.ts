// Ad-hoc output-quality audit: signs in, saves a BYOK AI key, runs N
// assessments, and dumps a compact summary (conformance outcome + AI verdicts +
// findings) for inspection.
// Usage: pnpm tsx scripts/quality-audit.ts
//   AUDIT_AI_KEY=sk-... AUDIT_AI_PROVIDER=dashscope AUDIT_AI_MODEL=qwen-vl-plus \
//   MAIL_API_URL=https://api.mail.gw pnpm tsx scripts/quality-audit.ts

const BASE = process.env.AUDIT_BASE_URL ?? "https://accessibility.ascent.partners";
const MAIL_API = process.env.MAIL_API_URL ?? "https://api.mail.gw";
const MAIL_DOMAIN = process.env.MAIL_DOMAIN ?? (MAIL_API.includes("mail.gw") ? "westcast-systems.com" : "emalupe.com");

const DEFAULT_SITES = [
  "https://example.com",
  "https://www.ascent.partners",
  "https://dialogue-experience.hk",
  "https://www.a11yproject.com",
  "https://www.gov.hk",
];

const SITES = (process.env.AUDIT_SITES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const AUDIT_SCOPE = process.env.AUDIT_SCOPE ?? "page";
const AI_KEY = process.env.AUDIT_AI_KEY ?? "";
const AI_PROVIDER = process.env.AUDIT_AI_PROVIDER ?? "dashscope";
const AI_MODEL = process.env.AUDIT_AI_MODEL ?? "qwen-vl-plus";

interface MailtmInbox {
  address: string;
  password: string;
  token: string;
}

async function createMailtmInbox(): Promise<MailtmInbox> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const address = `e2e-${suffix}@${MAIL_DOMAIN}`;
  const password = `e2e-pass-${suffix}`;
  const acct = await fetch(`${MAIL_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!acct.ok) throw new Error(`inbox account: ${acct.status}`);
  const tok = await fetch(`${MAIL_API}/token`, {
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
    const res = await fetch(`${MAIL_API}/messages`, {
      headers: { Authorization: `Bearer ${inbox.token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { "hydra:member": Array<{ id: string }> };
      const msgs = data["hydra:member"] ?? [];
      if (msgs.length > 0) {
        const m = await fetch(`${MAIL_API}/messages/${msgs[0]!.id}`, {
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

async function saveAiKey(cookie: string): Promise<void> {
  if (!AI_KEY) return;
  const save = await fetch(`${BASE}/api/account/ai-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ apiKey: AI_KEY, provider: AI_PROVIDER }),
  });
  if (save.status !== 200) {
    console.warn(`  [warn] ai-key save: HTTP ${save.status} ${await save.text()}`);
    return;
  }
  const models = await fetch(`${BASE}/api/account/models`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ provider: AI_PROVIDER, visionModel: AI_MODEL }),
  });
  if (models.status !== 200) {
    console.warn(`  [warn] model save: HTTP ${models.status}`);
  }
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

function dumpSite(url: string, a: Record<string, unknown>) {
  const findings = (a.findings ?? []) as Array<Record<string, unknown>>;
  const comparison = a.comparison as
    | {
        conformance?: {
          outcome?: string;
          passed?: number;
          failed?: number;
          cannotTell?: number;
          notPresent?: number;
          scsMet?: number;
          scsApplicable?: number;
        };
        ai?: { provider?: string; model?: string; verdicts?: Array<{ sc: string; verdict: string; confidence: number }> };
      }
    | undefined;

  console.log("=".repeat(72));
  console.log(`URL: ${url}`);
  console.log(`  status=${a.status} pages=${a.pagesScanned} conformance=${a.conformance}`);
  if (comparison?.conformance) {
    const c = comparison.conformance;
    console.log(
      `  SCs: passed=${c.passed} failed=${c.failed} cannotTell=${c.cannotTell} notPresent=${c.notPresent} (${c.scsMet}/${c.scsApplicable} met)`,
    );
  }
  if (comparison?.ai) {
    const ai = comparison.ai;
    const verdicts = ai.verdicts ?? [];
    const passes = verdicts.filter((v) => v.verdict === "Passed").length;
    const fails = verdicts.filter((v) => v.verdict === "Failed").length;
    const tells = verdicts.filter((v) => v.verdict === "CannotTell").length;
    console.log(`  AI review: ${ai.provider}/${ai.model} — ${verdicts.length} verdicts (${passes} passed, ${fails} failed, ${tells} cannot-tell)`);
  }
  console.log(`  findings: ${findings.length}`);
  for (const f of findings) {
    const scs = (f.wcagSc as string[] | undefined)?.join(",") || "(none)";
    const rec = String(f.recommendation ?? "").replace(/\s+/g, " ").slice(0, 120);
    console.log(`    [${f.impact}] ${f.ruleId} -> ${scs}`);
    console.log(`      ${rec}`);
  }
}

async function main() {
  const sites = SITES.length > 0 ? SITES : DEFAULT_SITES;
  const cookieA = await signIn();
  console.log("account A signed in");
  const cookieB = await signIn();
  console.log("account B signed in");

  if (AI_KEY) {
    await saveAiKey(cookieA);
    await saveAiKey(cookieB);
    console.log(`AI key saved (${AI_PROVIDER}/${AI_MODEL})`);
  } else {
    console.log("no AUDIT_AI_KEY — AI review will be skipped (Cannot tell stays unresolved)");
  }

  for (let i = 0; i < sites.length; i++) {
    const cookie = i < 3 ? cookieA : cookieB;
    const url = sites[i]!;
    const pageCap = AUDIT_SCOPE === "site" && url.includes("gov.hk") ? 10 : undefined;
    console.log(`\n>>> submitting ${url} ...`);
    const id = await submitAssessment(cookie, url, pageCap);
    await poll(id);
    const res = await fetch(`${BASE}/api/v1/assessments/${id}`);
    dumpSite(url, (await res.json()) as Record<string, unknown>);
  }
  console.log("\ndone");
}

main().catch((e) => {
  console.error("audit failed:", e);
  process.exit(1);
});
