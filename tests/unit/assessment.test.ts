import { describe, expect, it } from "vitest";
import {
  runAssessment,
  type AssessmentDeps,
  type AssessmentRecord,
  type AssessmentRepositoryPort,
  type FindingInput,
} from "@/lib/assessment";
import { getStandard } from "@/lib/standards/catalog";
import type { Impact } from "@/lib/scoring";

interface RepoState {
  status: string;
  findings: FindingInput[];
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
      nodeCount: 2,
    },
  ],
  passesCount: 3,
});

const emptyCrawl = async () => ({
  urls: [],
  pagesScanned: 0,
  partial: false,
  sitemapUsed: false,
  sitemapUrlCount: 0,
});

const createScanner = async () => ({ scan: scanOk, close: async () => {} });

describe("runAssessment", () => {
  it("crawls, scans, scores, and persists findings (AC-2/3/5/9)", async () => {
    const { repo, state } = makeRepo(assessment);
    const deps: AssessmentDeps = {
      repository: repo,
      crawlSite: async () => ({ urls: ["https://example.com/"], pagesScanned: 1, partial: false, sitemapUsed: false, sitemapUrlCount: 0 }),
      createScanner,
      resolveStandard: getStandard,
    };

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
    expect(state.completed).toMatchObject({ passBand: "pass", pagesScanned: 1 });
  });

  it("fails when the standard is unknown", async () => {
    const { repo, state } = makeRepo({ ...assessment, standard: "wcag99" });
    const deps: AssessmentDeps = {
      repository: repo,
      crawlSite: emptyCrawl,
      createScanner,
      resolveStandard: getStandard,
    };
    await runAssessment("a1", deps);
    expect(state.status).toBe("failed");
  });

  it("fails when nothing is crawled", async () => {
    const { repo, state } = makeRepo(assessment);
    const deps: AssessmentDeps = {
      repository: repo,
      crawlSite: emptyCrawl,
      createScanner,
      resolveStandard: getStandard,
    };
    await runAssessment("a1", deps);
    expect(state.status).toBe("failed");
  });

  it("propagates the partial flag from the crawl (AC-E5)", async () => {
    const { repo, state } = makeRepo(assessment);
    const deps: AssessmentDeps = {
      repository: repo,
      crawlSite: async () => ({ urls: ["https://example.com/"], pagesScanned: 1, partial: true, sitemapUsed: false, sitemapUrlCount: 0 }),
      createScanner,
      resolveStandard: getStandard,
    };
    await runAssessment("a1", deps);
    expect(state.completed?.partial).toBe(true);
  });

  it("is idempotent for an already-completed assessment", async () => {
    const { repo, state } = makeRepo({ ...assessment, status: "completed" });
    const deps: AssessmentDeps = {
      repository: repo,
      crawlSite: async () => {
        throw new Error("should not crawl");
      },
      createScanner,
      resolveStandard: getStandard,
    };
    await runAssessment("a1", deps);
    expect(state.status).toBe("completed");
  });
});
