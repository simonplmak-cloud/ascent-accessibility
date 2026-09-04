import type {
  AssessmentResult,
  ComparisonData,
  Conformance,
  Finding,
  LogEntry,
} from "@/components/assessment/types";
import type { ScannedPage } from "@/db/schema";

export type ExportFormat = "pdf";

// The exported report shares the on-screen data model so the PDF is a strict
// superset of what the screen shows (findings carry instances + sources, the
// comparison carries audit signals, and the whole record is available). The
// component types are pure type-only and safe to import from the export path.
export type ReportFinding = Finding;
export type ReportComparison = ComparisonData;
export type ReportConformance = Conformance;

// A reviewer's claim of an assessment (captured when they pick up the review).
export interface ReportReviewClaim {
  reviewerId?: string;
  reviewerName?: string;
  organization?: string;
  email?: string;
  evaluationMethods?: string[];
  claimedAt?: string;
}

// A single resolved success criterion from human review.
export interface ReportReviewResult {
  verdict: "Passed" | "Failed" | "NotPresent";
  note?: string;
  reviewedBy: string;
  reviewedAt: string;
}

// The signed conformance claim produced when a review is submitted.
export interface ReportConformanceClaim {
  outcome: "conforms" | "does-not-conform" | "undetermined";
  scsMet: number;
  scsApplicable: number;
  reviewer: string;
  organization: string;
  asAt: string;
  signedAt: string;
}

export interface ReportData {
  id?: string;
  url: string;
  standard: string;
  standardLabel?: string | null;
  depth?: number;
  outcome: "conforms" | "does-not-conform" | "undetermined";
  scsMet: number;
  scsApplicable: number;
  pagesScanned: number;
  partial?: boolean;
  score?: number | null;
  passBand?: string | null;
  reviewStatus?: string | null;
  reviewClaim?: ReportReviewClaim | null;
  reviewResults?: Record<string, ReportReviewResult>;
  conformanceClaim?: ReportConformanceClaim | null;
  reviewedAt?: string | null;
  snapshotAt?: string | null;
  generatedAt?: string;
  locale?: string | undefined;
  detectedLanguages?: string[];
  findings: ReportFinding[];
  comparison?: ReportComparison | undefined;
  log?: LogEntry[];
  pages?: ScannedPage[];
  sitemapUrls?: string[];
  sitemapUsed?: boolean;
  evidenceImages?: Record<string, { mime: string; dataUri: string }>;
}

export interface ExportResult {
  contentType: string;
  body: Buffer;
}

/** Renders a report into PDF bytes. Inject a fake in unit tests. */
export interface PdfRenderer {
  render(report: ReportData): Promise<Buffer>;
}

// Re-exported convenience alias used by older call sites.
export type { AssessmentResult, ComparisonData, Conformance, Finding, LogEntry };
