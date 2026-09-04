import { describe, expect, it } from "vitest";
import {
  buildConformanceClaim,
  claimReview,
  requestReview,
  submitReview,
  unresolvedScs,
  UnresolvedScsError,
  InvalidTransitionError,
  type ReviewStatus,
  type ReviewVerdict,
} from "@/lib/review";

const rows = [
  { num: "1.1.1", result: "Passed" },
  { num: "1.4.3", result: "Failed" },
  { num: "2.4.4", result: "NotTested" },
  { num: "1.2.1", result: "NotPresent" },
];

const claimMeta = {
  reviewer: "reviewer@partner.org",
  organization: "Partner Access Collective",
  asAt: "2026-08-18T09:00:00Z",
  signedAt: "2026-08-28T12:00:00Z",
};

describe("requestReview (state machine)", () => {
  it("transitions none → requested", () => {
    expect(requestReview("none")).toBe("requested");
  });

  it("rejects a request from any other state", () => {
    for (const status of ["requested", "in-review", "reviewed"] as ReviewStatus[]) {
      expect(() => requestReview(status)).toThrow(InvalidTransitionError);
    }
  });
});

describe("claimReview (state machine)", () => {
  it("claims a requested review", () => {
    expect(claimReview("requested", null, 60_000)).toBe("in-review");
  });

  it("keeps a fresh in-review claim held", () => {
    const claimedAt = new Date(Date.now() - 1_000).toISOString();
    expect(() => claimReview("in-review", claimedAt, 60_000)).toThrow(InvalidTransitionError);
  });

  it("reclaims a stale in-review claim", () => {
    const claimedAt = new Date(Date.now() - 120_000).toISOString();
    expect(claimReview("in-review", claimedAt, 60_000)).toBe("in-review");
  });

  it("rejects claiming a reviewed assessment", () => {
    expect(() => claimReview("reviewed", null, 60_000)).toThrow(InvalidTransitionError);
  });
});

describe("unresolvedScs", () => {
  it("returns applicable CannotTell SCs not yet resolved", () => {
    expect(unresolvedScs(rows, new Set(["1.1.1"]))).toEqual(["2.4.4"]);
  });

  it("returns an empty list when all CannotTell SCs are resolved", () => {
    expect(unresolvedScs(rows, new Set(["2.4.4"]))).toEqual([]);
  });
});

describe("buildConformanceClaim", () => {
  it("folds resolutions and computes a conforms outcome", () => {
    const claim = buildConformanceClaim({
      rows: [
        { num: "1.1.1", result: "Passed" },
        { num: "2.4.4", result: "NotTested" },
      ],
      resolutions: new Map<string, ReviewVerdict>([["2.4.4", "Passed"]]),
      ...claimMeta,
    });
    expect(claim.outcome).toBe("conforms");
    expect(claim.scsMet).toBe(2);
    expect(claim.scsApplicable).toBe(2);
    expect(claim.asAt).toBe("2026-08-18T09:00:00Z");
    expect(claim.signedAt).toBe("2026-08-28T12:00:00Z");
  });

  it("folds a Failed resolution to a does-not-conform outcome", () => {
    const claim = buildConformanceClaim({
      rows,
      resolutions: new Map<string, ReviewVerdict>([["2.4.4", "Failed"]]),
      ...claimMeta,
    });
    expect(claim.outcome).toBe("does-not-conform");
    expect(claim.scsApplicable).toBe(3);
  });
});

describe("submitReview", () => {
  it("rejects a submit with unresolved CannotTell SCs (AC-E1)", () => {
    expect(() =>
      submitReview({
        status: "in-review",
        rows,
        resolutions: new Map(),
        ...claimMeta,
      }),
    ).toThrow(UnresolvedScsError);
  });

  it("rejects a submit from a non-in-review state (AC-E2)", () => {
    expect(() =>
      submitReview({
        status: "requested",
        rows,
        resolutions: new Map<string, ReviewVerdict>([["2.4.4", "Passed"]]),
        ...claimMeta,
      }),
    ).toThrow(InvalidTransitionError);
  });

  it("issues a signed conformance claim on a fully-resolved submit (AC-12)", () => {
    const result = submitReview({
      status: "in-review",
      rows,
      resolutions: new Map<string, ReviewVerdict>([["2.4.4", "Passed"]]),
      ...claimMeta,
    });
    expect(result.status).toBe("reviewed");
    expect(result.claim).toMatchObject({
      outcome: "does-not-conform",
      reviewer: "reviewer@partner.org",
      organization: "Partner Access Collective",
    });
  });
});
