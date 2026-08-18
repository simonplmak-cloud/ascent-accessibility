import { describe, expect, it, vi } from "vitest";
import { runSiteAudit } from "@/lib/comparison/site-audit";

const report = {
  data: {
    auditVersion: "12.0.0",
    requestedUrl: "https://example.com/",
    audits: {
      "aria-command-name": { id: "aria-command-name", score: 0, weight: 7 },
      "button-name": { id: "button-name", score: 1, weight: 10 },
      "color-contrast": { id: "color-contrast", score: 0, weight: 7 },
    },
    categories: {
      accessibility: { score: 0.72 },
      performance: { score: 0.88 },
      seo: { score: 0.95 },
      "best-practices": { score: 0.9 },
      pwa: { score: 0.5 },
    },
  },
};

function fakeFetch(overrides: { ok?: boolean; status?: number } = {}) {
  const ok = overrides.ok ?? true;
  const status = overrides.status ?? 200;
  return vi.fn(async () => ({
    ok,
    status,
    json: async () => report,
  })) as unknown as typeof fetch;
}

describe("runSiteAudit", () => {
  it("POSTs to /performance and unwraps the accessibility score", async () => {
    const fetchFn = fakeFetch();
    const result = await runSiteAudit("https://example.com/", {
      fetchFn,
      httpUrl: "http://127.0.0.1:3000",
      token: "t",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "http://127.0.0.1:3000/performance?token=t",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.score).toBe(72);
    expect(result.signals).toEqual({
      accessibility: 72,
      performance: 88,
      seo: 95,
      bestPractices: 90,
      pwa: 50,
    });
    expect(result.auditVersion).toBe("12.0.0");
  });

  it("collects failed scored audits only", async () => {
    const result = await runSiteAudit("https://example.com/", {
      fetchFn: fakeFetch(),
      httpUrl: "http://127.0.0.1:3000",
    });
    expect(result.failedAudits).toEqual([
      { id: "aria-command-name", weight: 7 },
      { id: "color-contrast", weight: 7 },
    ]);
  });

  it("throws on a non-2xx response", async () => {
    await expect(
      runSiteAudit("https://example.com/", {
        fetchFn: fakeFetch({ ok: false, status: 503 }),
        httpUrl: "http://127.0.0.1:3000",
      }),
    ).rejects.toThrow(/HTTP 503/);
  });

  it("defaults the score to 100 when accessibility is absent", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { audits: {}, categories: {} } }),
    })) as unknown as typeof fetch;
    const result = await runSiteAudit("https://example.com/", {
      fetchFn,
      httpUrl: "http://127.0.0.1:3000",
    });
    expect(result.score).toBe(100);
  });
});
