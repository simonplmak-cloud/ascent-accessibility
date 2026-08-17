import { describe, expect, it } from "vitest";
import {
  runAssessment,
  type AssessmentDeps,
  type AssessmentRecord,
  type AssessmentRepositoryPort,
} from "@/lib/assessment";
import { getStandard } from "@/lib/standards/catalog";
import type { Finding } from "@/db/schema";
import type { Impact } from "@/lib/scoring";

interface RepoState {
  status: string;
  findings: Finding[];
  completed: { score: number; passBand: string; pagesScanned: number; partial: boolean } | null;
}

function makeRepo(assessment: AssessmentRecord) {
  const state: RepoState = { status: assessment.status, findings: [], completed: null };
  const repo: AssessmentRepositoryPort = {
    async findById() {
      return { ...assessment, status: state.status };
    },
    async setStatus(_id, status) {
      state.status = status;
    },
    async complete(_id, input) {
      state.status = "completed";
      state.completed = input;
    },
    async fail() {
      state.status = "failed";
    },
    async insertFindings(_id, items) {
      state.findings = items;
    },
    async insertComparison() {},
    async appendLog() {},
  };
  return { repo, state };
}

const assessment: AssessmentRecord = {
  id: "a1",
  url: "https://example.com/",
  standard: "wcag22aa",
  status: "queued",
  depth: 3,
  pageCap: 100,
};

const scanOk = async (url: string) => ({
  url,
  violations: [
    {
      id: "color-contrast",
      impact: "serious" as Impact,
      description: "Elements must meet minimum color contrast ratio thresholds",
      help: "Color contrast",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
      tags: ["wcag2aa", "wcag143"],
      nodes: [
        { html: "<a>", target: ["a"], failureSummary: "" },
        { html: "<b>", target: ["b"], failureSummary: "" },
      ],
      nodeCount: 2,
    },
  ],
  passes: [{ id: "region", tags: ["wcag2aa"] }],
  incomplete: [],
  features: {
    hasContent: true,
    hasVideo: false, hasAudio: false, hasVideoCaptions: false, hasAudioDescription: false,
    hasForms: false, hasTables: false, hasIframes: false, hasMetaRefresh: false,
    hasMarquee: false, hasAccesskey: false, hasPositiveTabindex: false, hasDragHandlers: false,
    hasTouchHandlers: false, hasImages: true, hasBackgroundImages: false,
    hasAnimatedContent: false, hasAutoplay: false, hasLiveContent: false, hasLinks: true,
    hasHeadings: true, hasLandmarks: true, hasLang: true, hasInteractive: true, hasTimeLimit: false,
  },
});

const emptyCrawl = async () => ({
  urls: [],
  pagesScanned: 0,
  partial: false,
  sitemapUsed: false,
  sitemapUrlCount: 0,
});

const createScanner = async () => ({
  scan: scanOk,
  captureEvidence: async () => ({
    fullPage: Buffer.alloc(0),
    fullPageMime: "image/jpeg",
    elements: [],
  }),
  scanIbm: async () => ({
    counts: { violation: 0, potentialViolation: 0, recommendation: 0, pass: 0, manual: 0 },
    findings: [],
  }),
  close: async () => {},
  discard: async () => {},
});

const evidenceStore = { put: async () => ({ id: "evidence:1" }) };

function makeDeps(
  repo: AssessmentRepositoryPort,
  crawlSite: AssessmentDeps["crawlSite"],
): AssessmentDeps {
  return {
    repository: repo,
    crawlSite,
    createScanner,
    resolveStandard: getStandard,
    evidenceStore,
  };
}

describe("runAssessment", () => {
  it("crawls, scans, scores, and persists findings (AC-2/3/5/9)", async () => {
    const { repo, state } = makeRepo(assessment);
    const deps = makeDeps(repo, async () => ({
      urls: ["https://example.com/"],
      pagesScanned: 1,
      partial: false,
      sitemapUsed: false,
      sitemapUrlCount: 0,
    }));

    await runAssessment("a1", deps);

    expect(state.status).toBe("completed");
    expect(state.findings).toHaveLength(1);
    expect(state.findings[0]).toMatchObject({
      ruleId: "color-contrast",
      impact: "serious",
      pageUrl: "https://example.com/",
      elementCount: 2,
    });
    expect(state.findings[0]!.recommendation.length).toBeGreaterThan(0);
    expect(state.findings[0]!.wcagSc).toEqual(["1.4.3"]);
    expect(state.completed).toMatchObject({ passBand: "pass", pagesScanned: 1 });
  });

  it("fails when the standard is unknown", async () => {
    const { repo, state } = makeRepo({ ...assessment, standard: "wcag99" });
    await runAssessment("a1", makeDeps(repo, emptyCrawl));
    expect(state.status).toBe("failed");
  });

  it("fails when nothing is crawled", async () => {
    const { repo, state } = makeRepo(assessment);
    await runAssessment("a1", makeDeps(repo, emptyCrawl));
    expect(state.status).toBe("failed");
  });

  it("propagates the partial flag from the crawl (AC-E5)", async () => {
    const { repo, state } = makeRepo(assessment);
    await runAssessment(
      "a1",
      makeDeps(repo, async () => ({
        urls: ["https://example.com/"],
        pagesScanned: 1,
        partial: true,
        sitemapUsed: false,
        sitemapUrlCount: 0,
      })),
    );
    expect(state.completed?.partial).toBe(true);
  });

  it("is idempotent for an already-completed assessment", async () => {
    const { repo, state } = makeRepo({ ...assessment, status: "completed" });
    await runAssessment(
      "a1",
      makeDeps(repo, async () => {
        throw new Error("should not crawl");
      }),
    );
    expect(state.status).toBe("completed");
  });
});
