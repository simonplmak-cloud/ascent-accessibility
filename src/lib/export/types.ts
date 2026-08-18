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

export interface ReportComparison {
  audit?: { score: number };
  conformance?: {
    total: number;
    compliant: number;
    violate: number;
    notApplicable: number;
    needHumanChecking: number;
    coverage: number;
    levelAttained: string;
  };
}

export interface ReportData {
  url: string;
  standard: string;
  score: number;
  passBand: string;
  pagesScanned: number;
  findings: ReportFinding[];
  generatedAt?: string;
  comparison?: ReportComparison;
}

export interface ExportResult {
  contentType: string;
  body: Buffer;
}

/** Renders a report into PDF bytes. Inject a fake in unit tests. */
export interface PdfRenderer {
  render(report: ReportData): Promise<Buffer>;
}
