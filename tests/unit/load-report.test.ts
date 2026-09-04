import { describe, expect, it } from "vitest";
import { buildConformanceClaim, latestReviewedAt } from "@/lib/export/load-report";
import type { ReportReviewResult } from "@/lib/export/types";
import type { Assessment } from "@/db/schema";

type ClaimAssessment = Pick<Assessment, "reviewStatus" | "conformance" | "scsMet" | "scsApplicable" | "snapshotAt" | "updatedAt">;

describe("latestReviewedAt", () => {
  it("returns the max reviewedAt across results", () => {
    const results: Record<string, ReportReviewResult> = {
      "1.1.1": { verdict: "Passed", reviewedBy: "a", reviewedAt: "2026-01-01T10:00:00Z" },
      "1.4.3": { verdict: "Failed", reviewedBy: "a", reviewedAt: "2026-01-01T11:00:00Z" },
    };
    expect(latestReviewedAt(results)).toBe("2026-01-01T11:00:00Z");
  });

  it("returns null for an empty result set", () => {
    expect(latestReviewedAt({})).toBeNull();
  });
});

describe("buildConformanceClaim", () => {
  const assessment: ClaimAssessment = {
    reviewStatus: "reviewed",
    conformance: "does-not-conform",
    scsMet: 30,
    scsApplicable: 40,
    snapshotAt: "2026-01-01T09:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  };

  it("returns null when the assessment is not reviewed", () => {
    expect(
      buildConformanceClaim(
        { ...assessment, reviewStatus: "in-review" },
        { reviewerName: "Jane" },
        "2026-01-01T11:00:00Z",
      ),
    ).toBeNull();
  });

  it("builds a claim from the assessment + review claim when reviewed", () => {
    const claim = buildConformanceClaim(
      assessment,
      { reviewerName: "Jane", organization: "Acme" },
      "2026-01-01T11:00:00Z",
    );
    expect(claim).toEqual({
      outcome: "does-not-conform",
      scsMet: 30,
      scsApplicable: 40,
      reviewer: "Jane",
      organization: "Acme",
      asAt: "2026-01-01T09:00:00Z",
      signedAt: "2026-01-01T11:00:00Z",
    });
  });

  it("falls back to updatedAt when snapshot/review times are missing", () => {
    const claim = buildConformanceClaim(
      { ...assessment, snapshotAt: null, updatedAt: "2026-01-02T00:00:00Z" },
      null,
      null,
    );
    expect(claim?.asAt).toBe("2026-01-02T00:00:00Z");
    expect(claim?.signedAt).toBe("2026-01-02T00:00:00Z");
    expect(claim?.reviewer).toBe("");
  });
});
