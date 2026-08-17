export interface FindingSource {
  tool: "engine" | "ai";
  ruleId: string;
  impact: string;
  message: string;
}

export interface FindingInstance {
  target: string;
  html: string;
  failureSummary: string;
  evidenceId: string | null;
}

export interface Finding {
  ruleId: string;
  impact: string;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
  help?: string;
  helpUrl?: string;
  wcagSc?: string[];
  wcagLevel?: string | null;
  scTitle?: string;
  confidence?: "confirmed" | "single-source";
  sources?: FindingSource[];
  instances?: FindingInstance[];
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface ConformanceRow {
  num: string;
  title: string;
  level: string;
  result: "pass" | "fail" | "not-applicable" | "needs-review";
}

export interface Conformance {
  total: number;
  passed: number;
  failed: number;
  notApplicable: number;
  needsReview: number;
  coverage: number;
  levelAttained: string;
  rows: ConformanceRow[];
}

export interface ComparisonData {
  audit?: {
    score: number;
    failedAudits: Array<{ id: string; weight: number }>;
    signals?: {
      accessibility?: number;
      performance?: number;
      seo?: number;
      bestPractices?: number;
      pwa?: number;
    };
    auditVersion?: string;
  };
  conformance?: Conformance;
  ai?: {
    model: string;
    verdicts: Array<{
      sc: string;
      verdict: "pass" | "fail" | "needs-review";
      confidence: number;
      reasoning: string;
      evidenceId?: string | null;
    }>;
    budget: { calls: number; images: number };
  };
}

export interface AssessmentResult {
  id: string;
  status: string;
  partial: boolean;
  url?: string;
  standard?: string;
  score: number | null;
  passBand: string | null;
  pagesScanned: number;
  log: LogEntry[];
  findings: Finding[];
  comparison?: ComparisonData;
}

export interface StandardOption {
  id: string;
  name: string;
}
