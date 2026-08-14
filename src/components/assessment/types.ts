export interface Finding {
  ruleId: string;
  impact: string;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface AssessmentResult {
  id: string;
  status: string;
  partial: boolean;
  score: number | null;
  passBand: string | null;
  pagesScanned: number;
  log: LogEntry[];
  findings: Finding[];
}

export interface StandardOption {
  id: string;
  name: string;
}
