export type ExportFormat = "pdf";

export interface ReportFinding {
  ruleId: string;
  impact: string;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
  wcagSc?: string[];
  scTitle?: string;
  confidence?: string;
  sources?: string[];
}

export interface ReportComparisonRow {
  num: string;
  title: string;
  level: string;
  result: string;
  machineResult?: string;
}

export interface ReportComparisonAiVerdict {
  sc: string;
  verdict: string;
  confidence: number;
  reasoning: string;
}

export interface ReportComparison {
  audit?: { score: number };
  conformance?: {
    total: number;
    passed: number;
    failed: number;
    notPresent: number;
    cannotTell: number;
    coverage: number;
    levelAttained: string;
    rows?: ReportComparisonRow[];
  };
  ai?: {
    model: string;
    verdicts: ReportComparisonAiVerdict[];
  };
}

export interface ReportData {
  url: string;
  standard: string;
  outcome: "conforms" | "does-not-conform" | "undetermined";
  scsMet: number;
  scsApplicable: number;
  pagesScanned: number;
  findings: ReportFinding[];
  generatedAt?: string;
  comparison?: ReportComparison;
  locale?: string;
}

export interface ExportResult {
  contentType: string;
  body: Buffer;
}

/** Renders a report into PDF bytes. Inject a fake in unit tests. */
export interface PdfRenderer {
  render(report: ReportData): Promise<Buffer>;
}
