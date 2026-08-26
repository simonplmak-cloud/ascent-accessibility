import { describe, expect, it } from "vitest";
import { assessStorageQuota } from "@/lib/storage-quota";
import { evidenceBytes } from "@/db/repository/evidence-repository";
import { retentionCutoffIso } from "@/lib/retention/cleanup";

const QUOTA = 524_288_000; // 500 MiB

describe("assessStorageQuota", () => {
  it("allows when committed usage + estimate fits the quota", () => {
    const decision = assessStorageQuota(0, QUOTA, 100, 122_880);
    expect(decision.allowed).toBe(true);
  });

  it("rejects a site scan whose estimate would exceed the remaining quota", () => {
    // 500 MiB - 1 byte + estimate > quota
    const decision = assessStorageQuota(QUOTA - 1, QUOTA, 100, 122_880);
    expect(decision.allowed).toBe(false);
  });

  it("allows exactly at the boundary", () => {
    const estimate = 100 * 122_880;
    const decision = assessStorageQuota(QUOTA - estimate, QUOTA, 100, 122_880);
    expect(decision.allowed).toBe(true);
    expect(decision.estimateBytes).toBe(estimate);
  });

  it("single-page scan estimates one page", () => {
    const decision = assessStorageQuota(0, QUOTA, 1, 122_880);
    expect(decision.estimateBytes).toBe(122_880);
  });
});

describe("evidenceBytes", () => {
  it("sums base64 image and HTML byte lengths", () => {
    expect(evidenceBytes("YWJj", "<p>hi</p>")).toBe(4 + Buffer.byteLength("<p>hi</p>"));
  });

  it("treats missing html as zero", () => {
    expect(evidenceBytes("YWJj", null)).toBe(4);
  });
});

describe("retentionCutoffIso", () => {
  it("computes a cutoff N days in the past", () => {
    const now = Date.UTC(2026, 0, 1);
    const cutoff = new Date(retentionCutoffIso(180, now));
    expect(cutoff.toISOString()).toBe(new Date(now - 180 * 86_400_000).toISOString());
  });
});
