export interface SiteAuditItem {
  id: string;
  title?: string;
  score: number | null;
  weight?: number;
}

export interface SiteSignals {
  accessibility?: number;
  performance?: number;
  seo?: number;
  bestPractices?: number;
  pwa?: number;
}

export interface SiteAuditReport {
  score: number;
  failedAudits: Array<{ id: string; weight: number }>;
  signals: SiteSignals;
  auditVersion?: string;
}

interface AuditResponse {
  data?: {
    auditVersion?: string;
    requestedUrl?: string;
    audits?: Record<string, SiteAuditItem>;
    categories?: Record<string, { score: number | null }>;
  };
}

const AUDIT_CATEGORIES = ["accessibility", "performance", "seo", "best-practices", "pwa"];

function deriveHttpBase(): string {
  const override = process.env.BROWSERLESS_HTTP_URL;
  if (override) return override.replace(/\/$/, "");
  const ws = process.env.BROWSERLESS_URL ?? "ws://127.0.0.1:3000";
  return ws.replace(/^ws:/, "http:").replace(/^wss:/, "https:");
}

function toPercent(score: number | null | undefined): number | undefined {
  if (typeof score !== "number" || Number.isNaN(score)) return undefined;
  return Math.round(score * 100);
}

export async function runSiteAudit(
  url: string,
  deps: { fetchFn?: typeof fetch; httpUrl?: string; token?: string } = {},
): Promise<SiteAuditReport> {
  const base = (deps.httpUrl ?? deriveHttpBase()).replace(/\/$/, "");
  const token = deps.token ?? process.env.BROWSERLESS_TOKEN ?? "";
  const endpoint = `${base}/performance${token ? `?token=${token}` : ""}`;

  const res = await (deps.fetchFn ?? fetch)(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify({
      url,
      config: {
        settings: { onlyCategories: AUDIT_CATEGORIES },
      },
    }),
    signal: AbortSignal.timeout(Number(process.env.SITE_AUDIT_TIMEOUT_MS ?? 90_000)),
  });
  if (!res.ok) throw new Error(`Site audit HTTP ${res.status}`);

  const json = (await res.json()) as AuditResponse;
  const data = json.data;
  if (!data) throw new Error("Site audit response missing data");

  const audits = data.audits ?? {};
  const failedAudits: Array<{ id: string; weight: number }> = [];
  for (const [id, audit] of Object.entries(audits)) {
    if (audit.score !== null && audit.score < 1 && typeof audit.weight === "number") {
      failedAudits.push({ id, weight: audit.weight });
    }
  }

  return {
    score: toPercent(data.categories?.accessibility?.score) ?? 100,
    failedAudits,
    signals: {
      accessibility: toPercent(data.categories?.accessibility?.score),
      performance: toPercent(data.categories?.performance?.score),
      seo: toPercent(data.categories?.seo?.score),
      bestPractices: toPercent(data.categories?.["best-practices"]?.score),
      pwa: toPercent(data.categories?.pwa?.score),
    },
    auditVersion: data.auditVersion,
  };
}
