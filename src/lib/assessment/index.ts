import { type ConformanceResult } from "@/lib/scoring";
import { type CrawlOptions, type CrawlResult } from "@/lib/crawler";
import { ScanFailedError, type ScanResult, type ScanViolation, type RuleSummary } from "@/lib/scanner";
import type { CapturedEvidence } from "@/lib/evidence/screenshot";
import {
  violationsToFindings,
  consolidateFindings,
  type ToolFinding,
} from "@/lib/comparison/consolidate";
import type { SiteAuditReport } from "@/lib/comparison/site-audit";
import { scsForTags } from "@/lib/standards/wcag-sc";
import { isValidSc } from "@/lib/standards/sc-coverage";
import {
  EMPTY_FEATURES,
  mergeFeatures,
  type PageFeatures,
} from "@/lib/standards/sc-applicability";
import { wcagReference, type Standard } from "@/lib/standards/catalog";
import type { AiBudget, AiReview, VisionModel, VisionReviewTools } from "@/lib/ai-review/types";
import { toolImplByName } from "@/lib/ai-review/tools";
import type { AudioModel } from "@/lib/ai-review/audio";
import { evaluateStandard } from "@/lib/assessment/evaluate";
import { resolveDetectedLanguages } from "@/lib/standards/language-detect";
import { verifyTokenFor, VERIFY_META_NAME } from "@/lib/site/bot-identity";
import type { Finding, LogEntry, LogLevel, NewEvidence, ScannedPage } from "@/db/schema";
import { logger } from "@/lib/observability/logger";
import { analyzeCrossPage, extractPageStructure, type PageStructure } from "@/lib/assessment/cross-page";

export interface AssessmentRecord {
  id: string;
  url: string;
  standard: string;
  status: string;
  depth: number;
  pageCap: number;
  ownerId: string | null;
  locale: string | null;
}

export interface ComparisonData {
  audit?: SiteAuditReport | undefined;
  conformance: ConformanceResult;
  ai?: { provider: string; model: string; verdicts: AiReview[]; budget: AiBudget } | undefined;
}

export interface AssessmentRepositoryPort {
  findById(id: string): Promise<AssessmentRecord | undefined>;
  setStatus(id: string, status: string): Promise<void>;
  complete(
    id: string,
    input: {
      conformance: "conforms" | "does-not-conform" | "undetermined";
      scsMet: number;
      scsApplicable: number;
      pagesScanned: number;
      partial: boolean;
    },
  ): Promise<void>;
  finalize(
    id: string,
    input: {
      conformance: "conforms" | "does-not-conform" | "undetermined";
      scsMet: number;
      scsApplicable: number;
      pagesScanned: number;
      partial: boolean;
      findings: Finding[];
      comparison: unknown;
      snapshotAt: string;
      pageSnapshots: Record<string, { screenshotEvidenceId: string | null; htmlEvidenceId: string | null }>;
      pages: ScannedPage[];
      sitemapUrls: string[];
      detectedLanguages: string[];
    },
  ): Promise<void>;
  fail(id: string): Promise<void>;
  block(id: string, input: { reason: string; pages: ScannedPage[] }): Promise<void>;
  insertFindings(id: string, findings: Finding[]): Promise<void>;
  insertComparison(id: string, comparison: ComparisonData): Promise<void>;
  appendLog(id: string, entries: LogEntry[]): Promise<void>;
  setLog(id: string, entries: LogEntry[]): Promise<void>;
}

export interface EvidenceStorePort {
  put(input: NewEvidence): Promise<{ id: string }>;
}

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  captureEvidence: (result: ScanResult) => Promise<CapturedEvidence>;
  screenshotPage: () => Promise<Buffer>;
  snapshotPage: () => Promise<{ html: string; screenshot: Buffer }>;
  interactionScan: () => Promise<{ violations: ScanViolation[]; passes: RuleSummary[] }>;
  evaluate: (fn: (arg: unknown) => unknown, arg?: unknown) => Promise<unknown>;
  pageTitle: () => Promise<string>;
  detectPageLanguage: () => Promise<{ lang: string | null; text: string }>;
  close: () => Promise<void>;
  discard: () => Promise<void>;
}

export interface ResolvedAi {
  provider: string;
  visionModelId: string;
  visionModel: VisionModel | null;
  audioModel: AudioModel | null;
}

export interface AssessmentDeps {
  repository: AssessmentRepositoryPort;
  crawlSite: (seed: URL, options: CrawlOptions) => Promise<CrawlResult>;
  createScanner: () => Promise<PageScanner>;
  resolveStandard: (id: string) => Standard | undefined;
  evidenceStore: EvidenceStorePort;
  siteAudit?: (url: string) => Promise<SiteAuditReport>;
  resolveByokModel?: (ownerId: string) => Promise<ResolvedAi | null>;
  concurrency?: number;
}

interface ConsolidateOutput {
  findings: Finding[];
  passedScs: Set<string>;
  matchedScs: Set<string>;
  features: PageFeatures;
  aiScreenshot: Buffer | null;
  firstScanner: PageScanner | null;
  incompleteContext: string[];
  mediaUrls: string[];
  snapshotAt: string;
  pageSnapshots: Record<string, { screenshotEvidenceId: string | null; htmlEvidenceId: string | null }>;
  pages: ScannedPage[];
  detectedLanguages: string[];
  blockedReason: string | null;
}

export async function runAssessment(
  assessmentId: string,
  deps: AssessmentDeps,
): Promise<void> {
  const assessment = await deps.repository.findById(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found`);
  }
  if (assessment.status === "completed" || assessment.status === "failed") {
    return;
  }

  const standard = deps.resolveStandard(assessment.standard);
  if (!standard) {
    await deps.repository.fail(assessmentId);
    return;
  }

  await deps.repository.setStatus(assessmentId, "running");

  // Buffered live log: entries accumulate in memory and are flushed (a full
  // overwrite, no read) every 300ms — avoids a read+write round-trip per entry.
  const logEntries: LogEntry[] = [];
  let flushing = false;
  const flushLogs = async (): Promise<void> => {
    if (flushing || logEntries.length === 0) return;
    flushing = true;
    try {
      await deps.repository.setLog(assessmentId, [...logEntries]);
    } catch (error) {
      // A transient write conflict is retried inside setLog; if it still fails,
      // drop this flush (the final flush in the finally block retries) — never
      // let a log write crash the worker.
      logger.warn({ err: error, assessmentId }, "log flush failed (will retry)");
    } finally {
      flushing = false;
    }
  };
  const flushTimer = setInterval(() => void flushLogs(), 300);
  const log = (level: LogLevel, message: string): Promise<void> => {
    logEntries.push({ timestamp: new Date().toISOString(), level, message });
    return Promise.resolve();
  };

  let firstScanner: PageScanner | null = null;

  try {
    const seed = new URL(assessment.url);
    await log("info", `assessment started for ${assessment.url}`);

    // Single-page scans (depth 0) skip the crawl entirely — there is nothing to
    // discover, and the robots/sitemap/page fetches are pure overhead.
    let urls: string[];
    let pagesScanned: number;
    let partial: boolean;
    let sitemapUrls: string[] = [];
    if (assessment.depth === 0) {
      urls = [seed.href];
      pagesScanned = 1;
      partial = false;
      await log("info", "single-page scan — scanning the URL directly");
    } else {
      const crawlResult = await deps.crawlSite(seed, {
        maxDepth: assessment.depth,
        maxPages: assessment.pageCap,
      });
      for (const message of crawlResult.log ?? []) {
        await log("info", message);
      }
      if (crawlResult.urls.length === 0) {
        await log("info", "crawl found no pages — falling back to single-page scan");
        urls = [seed.href];
        pagesScanned = 1;
        partial = false;
        sitemapUrls = [];
      } else {
        await log("info", `crawl complete: ${crawlResult.urls.length} page(s) to scan`);
        urls = crawlResult.urls;
        pagesScanned = crawlResult.pagesScanned;
        partial = crawlResult.partial;
        sitemapUrls = crawlResult.sitemapUrls;
      }
    }

    const output = await scanAndConsolidate(urls, standard, deps, assessmentId, assessment.ownerId, log);
    firstScanner = output.firstScanner;

    // Every attempted page was rejected by bot/WAF protection — surface a
    // truthful `blocked` terminal state instead of a misleading "completed" 0%.
    if (output.blockedReason) {
      clearInterval(flushTimer);
      await flushLogs();
      await deps.repository.block(assessmentId, { reason: output.blockedReason, pages: output.pages });
      await log("info", `scan blocked — every page was rejected by bot/WAF protection (${output.blockedReason})`);
      await flushLogs();
      return;
    }

    await log(
      "info",
      `scan complete: ${output.findings.length} finding(s) across ${urls.length} page(s)`,
    );

    // AI model resolution — BYOK only (no platform key). No saved key → no AI.
    let resolvedAi: ResolvedAi | null = null;
    if (deps.resolveByokModel && assessment.ownerId) {
      try {
        resolvedAi = await deps.resolveByokModel(assessment.ownerId);
      } catch {
        resolvedAi = null;
      }
    }

    const toolRunner: VisionReviewTools | undefined = output.firstScanner
      ? {
          run: async (name, args) => {
            const impl = toolImplByName(name);
            if (!impl) throw new Error(`unknown AI tool: ${name}`);
            const scanner = output.firstScanner;
            if (!scanner) throw new Error("AI tool runner lost the page");
            return scanner.evaluate(impl as (arg: unknown) => unknown, args);
          },
        }
      : undefined;

    const evaluated = await evaluateStandard(
      {
        version: wcagReference(standard).version,
        level: wcagReference(standard).level,
        findings: output.findings,
        passedScs: output.passedScs,
        matchedScs: output.matchedScs,
        features: output.features,
        pageUrl: seed.href,
      },
      {
        visionModel: resolvedAi?.visionModel ?? undefined,
        audioModel: resolvedAi?.audioModel ?? undefined,
        aiScreenshot: output.aiScreenshot,
        incompleteContext: output.incompleteContext,
        mediaUrls: output.mediaUrls,
        threshold: Number(process.env.AI_REVIEW_CONFIDENCE_THRESHOLD ?? 0.8),
        locale: assessment.locale ?? undefined,
        pageLanguages: output.detectedLanguages,
        tools: toolRunner,
      },
    );

    const findings = evaluated.findings;
    const conformance = evaluated.conformance;
    const aiVerdicts = evaluated.aiVerdicts;
    const aiBudget = evaluated.aiBudget;

    await log(
      "info",
      `WCAG conformance: ${conformance.passed} Passed / ${conformance.failed} Failed / ${conformance.notPresent} Not present / ${conformance.notTested} Not tested (${conformance.coverage}% tested)`,
    );
    await log(
      "info",
      `conformance outcome: ${conformance.outcome} (${conformance.scsMet}/${conformance.scsApplicable} applicable SCs meet)`,
    );

    const comparison: ComparisonData = {
      conformance,
      ai: resolvedAi?.visionModel
        ? { provider: resolvedAi.provider, model: resolvedAi.visionModelId, verdicts: aiVerdicts, budget: aiBudget }
        : undefined,
    };

    await log("info", `storing findings and evidence (${findings.length} findings)`);
    // Stop the periodic live-log flush and flush once, so finalize() is the last
    // write on the record — a concurrent setLog would otherwise hit a SurrealDB
    // "Transaction conflict: Resource busy" and lose the race.
    clearInterval(flushTimer);
    await flushLogs();
    await deps.repository.finalize(assessmentId, {
      conformance: conformance.outcome,
      scsMet: conformance.scsMet,
      scsApplicable: conformance.scsApplicable,
      pagesScanned,
      partial,
      findings,
      comparison,
      snapshotAt: output.snapshotAt,
      pageSnapshots: output.pageSnapshots,
      pages: output.pages,
      sitemapUrls,
      detectedLanguages: output.detectedLanguages,
    });
    await log("info", "assessment complete");
    await flushLogs();

    // Backfill the site audit (Lighthouse) after the accessibility result is
    // already finalized and readable — the perf/SEO appendix fills in later.
    if (deps.siteAudit) {
      try {
        const audit = await runSiteAudit(urls, deps);
        if (audit) {
          await deps.repository.insertComparison(assessmentId, { ...comparison, audit });
        }
      } catch {
        /* audit backfill failed — the accessibility result stands */
      }
    }
  } catch (error) {
    // Transient error: re-throw so the worker can retry (retry-exhaustion
    // failure is handled by the worker route, not here).
    throw error;
  } finally {
    clearInterval(flushTimer);
    await flushLogs();
    if (firstScanner) {
      try {
        await firstScanner.close();
      } catch {
        /* ignore */
      }
    }
  }
}

// Per-page scan timeout. A pathological page can hang a worker forever and
// block the whole queue. On timeout we close and recreate the browser so the
// hung operation is actually torn down.
const PAGE_TIMEOUT_MS = Number(process.env.WORKER_PAGE_TIMEOUT_MS ?? 180_000);

export class PageTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "PageTimeoutError";
  }
}

async function withTimeout<T>(
  operation: () => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PageTimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// SCs from a scan result item, preferring the explicit `wcagSc` list and
// falling back to the `wcag<num>` tags. Values are whitelisted against the
// catalog — in-page output is untrusted.
function scsOf(item: { wcagSc?: string[]; tags?: string[] }): string[] {
  const source = item.wcagSc && item.wcagSc.length > 0 ? item.wcagSc : scsForTags(item.tags ?? []);
  return source.filter(isValidSc);
}

// Map a scan failure to a concise, user-facing reason. `ScanFailedError` wraps
// the HTTP status ("HTTP 403") or the navigation error; classify the common
// bot-protection / rate-limit / server-error signatures so the live log reads
// as a clear diagnosis instead of a bare "failed to load".
export function describeScanFailure(error: unknown): string {
  if (error instanceof PageTimeoutError) return "timed out";
  if (error instanceof ScanFailedError) {
    const message = error.message;
    const http = message.match(/HTTP (\d{3})/);
    if (http) {
      const code = http[1]!;
      if (code === "403") return "blocked (HTTP 403 — bot/WAF protection)";
      if (code === "429") return "rate limited (HTTP 429)";
      if (code === "404" || code === "410") return `not found (HTTP ${code})`;
      if (code === "500" || code === "502" || code === "503" || code === "504") {
        return `server error (HTTP ${code})`;
      }
      return `HTTP ${code}`;
    }
    const netErr = message.match(/net::(ERR_[A-Z_]+)/);
    if (netErr) return `network error (${netErr[1]})`;
    return "load failed";
  }
  return error instanceof Error ? error.message : String(error);
}

// Classify a page-load error as a deliberate bot/WAF block (as opposed to a
// timeout, DNS failure, or server 5xx). Used to decide the terminal `blocked`
// state when every attempted page was rejected.
function classifyBlock(error: unknown): "bot-protection" | "rate-limited" | null {
  const message = String((error as { message?: string } | undefined)?.message ?? "");
  if (/HTTP 403/.test(message)) return "bot-protection";
  if (/HTTP 429/.test(message)) return "rate-limited";
  return null;
}

function computeBlockedReason(
  pages: ScannedPage[],
  failedPageCount: number,
  botProtectionSeen: boolean,
  rateLimitedSeen: boolean,
): string | null {
  if (pages.length === 0 || failedPageCount !== pages.length) return null;
  if (botProtectionSeen) return "bot-protection";
  if (rateLimitedSeen) return "rate-limited";
  return null;
}

async function scanAndConsolidate(
  urls: string[],
  standard: Standard,
  deps: AssessmentDeps,
  assessmentId: string,
  ownerId: string | null,
  log: (level: LogLevel, message: string) => void,
): Promise<ConsolidateOutput> {
  const engineFindings: ToolFinding[] = [];
  const passedScs = new Set<string>();
  const matchedScs = new Set<string>();
  let features: PageFeatures = EMPTY_FEATURES;
  let aiScreenshot: Buffer | null = null;
  let firstScanner: PageScanner | null = null;
  const incompleteContext: string[] = [];
  const mediaUrls: string[] = [];
  const pageStructures: PageStructure[] = [];
  const detectedLanguages = new Set<string>();
  const seenMedia = new Set<string>();
  const snapshotAt = new Date().toISOString();
  const pageSnapshots: Record<string, { screenshotEvidenceId: string | null; htmlEvidenceId: string | null }> = {};
  const pages: ScannedPage[] = [];
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];
  let failedPageCount = 0;
  let botProtectionSeen = false;
  let rateLimitedSeen = false;

  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      let scanner = await deps.createScanner();
      try {
        for (let pageUrl = queue.shift(); pageUrl !== undefined; pageUrl = queue.shift()) {
          const url = pageUrl;
          const startedAt = Date.now();
          let title = "";
          try {
            await withTimeout(
              async () => {
                log("info", `scanning ${url} with the Ascent Accessibility engine`);

                const scan = await scanner.scan(url, standard.tags);
                log("info", `engine: ${scan.violations.length} violation(s) on ${url}`);

                // A rule whose extract/check threw must be visible, not silently
                // reported as "pass"/"incomplete" — surface each error in the log.
                for (const err of scan.errors ?? []) {
                  log("warn", `engine error: ${err.ruleId} (${err.phase}): ${err.message}`);
                }

                try {
                  title = await scanner.pageTitle();
                } catch {
                  /* title unavailable — leave blank */
                }

                // Best-effort page-language detection (declared lang + sampled text).
                try {
                  const { lang, text } = await scanner.detectPageLanguage();
                  for (const l of resolveDetectedLanguages(lang, text)) detectedLanguages.add(l);
                } catch {
                  /* detection optional — never fails the scan */
                }

                // Best-effort authorization check: a site owner proves the scan is
                // authorized by placing a meta tag with their per-owner verify token.
                if (ownerId) {
                  try {
                    const meta = (await scanner.evaluate(
                      (name) => {
                        const el = document.querySelector(`meta[name="${name}"]`);
                        return el ? el.getAttribute("content") : null;
                      },
                      VERIFY_META_NAME,
                    )) as string | null;
                    if (meta === verifyTokenFor(ownerId)) {
                      log("info", "site verified — owner authorized this scan");
                    }
                  } catch {
                    /* optional — never fails the scan */
                  }
                }

                // Freeze a point-in-time snapshot (full-page HTML + screenshot) so
                // a later human review judges exactly what was scanned, even after
                // the live site changes. The HTML is stored as its own evidence
                // record (never inlined into the batched finalize write, which
                // would exceed SurrealDB's HTTP request size limit on large sites).
                try {
                  const snap = await scanner.snapshotPage();
                  let screenshotEvidenceId: string | null = null;
                  let htmlEvidenceId: string | null = null;
                  try {
                    const ev = await deps.evidenceStore.put({
                      assessmentId,
                      ownerId,
                      pageUrl: url,
                      kind: "page",
                      image: snap.screenshot.toString("base64"),
                      mime: "image/jpeg",
                    });
                    screenshotEvidenceId = ev.id;
                  } catch {
                    /* evidence store unavailable — keep the HTML snapshot only */
                  }
                  try {
                    const html = await deps.evidenceStore.put({
                      assessmentId,
                      ownerId,
                      pageUrl: url,
                      kind: "snapshot",
                      image: "",
                      mime: "text/html",
                      html: snap.html,
                    });
                    htmlEvidenceId = html.id;
                  } catch {
                    /* evidence store unavailable — HTML snapshot dropped */
                  }
                  pageSnapshots[url] = { screenshotEvidenceId, htmlEvidenceId };
                } catch {
                  /* snapshot unavailable — review falls back to live evidence */
                }

                for (const violation of scan.violations) {
                  for (const sc of scsOf(violation)) matchedScs.add(sc);
                }
                for (const pass of scan.passes) {
                  for (const sc of scsOf(pass)) {
                    passedScs.add(sc);
                    matchedScs.add(sc);
                  }
                }
                features = mergeFeatures(features, scan.features);
                for (const m of scan.mediaUrls) {
                  if (!seenMedia.has(m)) {
                    seenMedia.add(m);
                    mediaUrls.push(m);
                  }
                }
                try {
                  const structure = (await scanner.evaluate(
                    extractPageStructure as unknown as (arg: unknown) => unknown,
                  )) as PageStructure;
                  if (structure && typeof structure === "object" && structure.url) {
                    pageStructures.push(structure);
                  }
                } catch {
                  /* structure extraction optional */
                }

                const pageFindings = violationsToFindings(url, scan.violations);
                await captureAndAttachEvidence(
                  url,
                  scan,
                  pageFindings,
                  scanner,
                  deps.evidenceStore,
                  assessmentId,
                  ownerId,
                );
                if (scan.violations.length > 0) {
                  log("info", `captured screenshot evidence for ${url}`);
                }
                engineFindings.push(...pageFindings);

                for (const inc of scan.incomplete) {
                  for (const sc of scsOf(inc)) matchedScs.add(sc);
                  for (const node of inc.nodes ?? []) {
                    if (node.failureSummary) {
                      incompleteContext.push(`${inc.id}: ${node.failureSummary}`);
                    }
                  }
                }

                try {
                  const interaction = await scanner.interactionScan();
                  if (interaction.violations.length > 0) {
                    for (const violation of interaction.violations) {
                      for (const sc of scsOf(violation)) matchedScs.add(sc);
                    }
                    engineFindings.push(...violationsToFindings(url, interaction.violations));
                  }
                  for (const pass of interaction.passes) {
                    for (const sc of scsOf(pass)) {
                      passedScs.add(sc);
                      matchedScs.add(sc);
                    }
                  }
                } catch {
                  /* interaction checks unavailable — continue with the engine alone */
                }

                if (!aiScreenshot) {
                  try {
                    aiScreenshot = await scanner.screenshotPage();
                    firstScanner = scanner;
                  } catch {
                    /* AI screenshot optional — triage degrades to needs-review */
                  }
                }
              },
              PAGE_TIMEOUT_MS,
              `scan of ${url}`,
            );
            pages.push({ url, title, status: "scanned", scanTimeMs: Date.now() - startedAt });
          } catch (error) {
            // A single bad page (browser crash, scan timeout, or load failure)
            // must not fail the whole assessment — restart the browser and
            // continue with the next page.
            const reason = describeScanFailure(error);
            log("warn", `page scan ${reason} — restarting browser: ${url}`);
            pages.push({ url, title: "", status: "failed", scanTimeMs: Date.now() - startedAt, error: reason });
            failedPageCount += 1;
            const block = classifyBlock(error);
            if (block === "bot-protection") botProtectionSeen = true;
            else if (block === "rate-limited") rateLimitedSeen = true;
            try {
              await scanner.discard();
            } catch {
              /* ignore */
            }
            scanner = await deps.createScanner();
          }
        }
      } finally {
        // Keep the first page's scanner open so the agentic AI review can run
        // its browser tools against the live page; it is closed after evaluate.
        if (scanner !== firstScanner) {
          try {
            await scanner.close();
          } catch {
            /* ignore */
          }
        }
      }
    },
  );

  await Promise.all(workers);

  const findings = consolidateFindings(engineFindings);

  // Cross-page pass: resolve presence/consistency SCs from the collected
  // per-page structures (deterministic — before the AI review runs).
  const cross = analyzeCrossPage(pageStructures);
  for (const sc of cross.passes) passedScs.add(sc);
  findings.push(...cross.findings);

  return {
    findings,
    passedScs,
    matchedScs,
    features,
    aiScreenshot,
    firstScanner,
    incompleteContext,
    mediaUrls,
    snapshotAt,
    pageSnapshots,
    pages,
    detectedLanguages: [...detectedLanguages],
    blockedReason: computeBlockedReason(pages, failedPageCount, botProtectionSeen, rateLimitedSeen),
  };
}

// Runs the site audit (Lighthouse) over the scanned pages concurrently and
// aggregates the signals into a single SiteAuditReport. Called as a backfill
// after the accessibility result has already been finalized, so the report is
// readable immediately and the audit appendix fills in shortly after.
async function runSiteAudit(
  urls: string[],
  deps: AssessmentDeps,
): Promise<SiteAuditReport | undefined> {
  if (!deps.siteAudit) return undefined;

  const signalSums = new Map<string, number>();
  const failedAudits = new Map<string, number>();
  let auditRuns = 0;
  let auditVersion: string | undefined;
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      try {
        const audit = await deps.siteAudit!(url);
        if (audit.signals) {
          for (const [key, value] of Object.entries(audit.signals)) {
            if (typeof value === "number") {
              signalSums.set(key, (signalSums.get(key) ?? 0) + value);
            }
          }
          auditRuns += 1;
        }
        for (const failed of audit.failedAudits) {
          failedAudits.set(failed.id, failed.weight);
        }
        if (audit.auditVersion) auditVersion = audit.auditVersion;
      } catch {
        /* audit failed for this page — skip */
      }
    }
  });

  await Promise.all(workers);

  if (auditRuns === 0) return undefined;

  const avg = (key: string): number | undefined => {
    const sum = signalSums.get(key);
    return sum === undefined ? undefined : Math.round(sum / auditRuns);
  };

  return {
    score: avg("accessibility") ?? 100,
    failedAudits: [...failedAudits.entries()].map(([id, weight]) => ({ id, weight })),
    signals: {
      accessibility: avg("accessibility"),
      performance: avg("performance"),
      seo: avg("seo"),
      bestPractices: avg("bestPractices"),
      pwa: avg("pwa"),
    },
    auditVersion,
  };
}

async function captureAndAttachEvidence(
  pageUrl: string,
  scan: ScanResult,
  pageFindings: ToolFinding[],
  scanner: PageScanner,
  evidenceStore: EvidenceStorePort,
  assessmentId: string,
  ownerId: string | null,
): Promise<void> {
  if (scan.violations.length === 0) return;

  let captured: CapturedEvidence;
  try {
    captured = await scanner.captureEvidence(scan);
  } catch {
    return;
  }

  let fullPageId: string | null = null;
  try {
    const ev = await evidenceStore.put({
      assessmentId,
      ownerId,
      pageUrl,
      kind: "page",
      image: captured.fullPage.toString("base64"),
      mime: captured.fullPageMime,
    });
    fullPageId = ev.id;
  } catch {
    /* evidence store unavailable — continue without page screenshot */
  }

  const elementIds = new Map<string, string>();
  for (const el of captured.elements) {
    try {
      const ev = await evidenceStore.put({
        assessmentId,
        ownerId,
        pageUrl,
        kind: "element",
        image: el.buffer.toString("base64"),
        mime: el.mime,
      });
      elementIds.set(`${el.ruleId}:${el.instanceIndex}`, ev.id);
    } catch {
      /* skip individual evidence on failure */
    }
  }

  for (const finding of pageFindings) {
    for (let i = 0; i < finding.nodes.length; i++) {
      const id = elementIds.get(`${finding.ruleId}:${i}`) ?? fullPageId;
      if (id) finding.nodes[i]!.evidenceId = id;
    }
  }
}
