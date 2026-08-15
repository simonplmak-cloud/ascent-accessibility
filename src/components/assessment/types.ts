export interface FindingSource {
  tool: "axe" | "lighthouse" | "ibm";
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
  result: "pass" | "fail" | "not-tested";
}

export interface Conformance {
  total: number;
  passed: number;
  failed: number;
  notTested: number;
  levelAttained: string;
  rows: ConformanceRow[];
}

export interface ComparisonData {
  lighthouse: { score: number; failedAudits: Array<{ id: string; weight: number }> };
  ibm: {
    violation: number;
    potentialViolation: number;
    recommendation: number;
    pass: number;
    manual: number;
  };
  conformance?: Conformance;
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
