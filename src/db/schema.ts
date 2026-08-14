import type { Impact } from "@/lib/scoring";

export type AssessmentStatus = "queued" | "running" | "completed" | "failed";
export type PassBand = "pass" | "partial" | "fail";
export type ApiKeyStatus = "active" | "revoked";

export interface Finding {
  ruleId: string;
  impact: Impact;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
}

export interface Assessment {
  id: string;
  url: string;
  standard: string;
  status: AssessmentStatus;
  partial: boolean;
  score: number | null;
  passBand: PassBand | null;
  depth: number;
  pageCap: number;
  pagesScanned: number;
  attempts: number;
  lastError: string | null;
  findings: Finding[];
  createdAt: string;
  updatedAt: string;
}

export interface NewAssessment {
  url: string;
  standard: string;
  depth?: number;
  pageCap?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  rateLimit: number;
  status: ApiKeyStatus;
  expiresAt: Date | null;
  createdAt: string;
}

export interface NewApiKey {
  name: string;
  keyHash: string;
  keyPrefix: string;
  rateLimit: number;
}

export interface AuditLog {
  id: string;
  apiKeyId: string | null;
  action: string;
  resourceId: string | null;
  ip: string;
  createdAt: string;
}

export interface NewAuditLog {
  apiKeyId?: string | null;
  action: string;
  resourceId?: string | null;
  ip: string;
}

export const SCHEMA_STATEMENTS: string[] = [
  `DEFINE TABLE assessment SCHEMAFULL;
DEFINE FIELD url ON assessment TYPE string;
DEFINE FIELD standard ON assessment TYPE string;
DEFINE FIELD status ON assessment TYPE string DEFAULT "queued";
DEFINE FIELD partial ON assessment TYPE bool DEFAULT false;
DEFINE FIELD score ON assessment TYPE option<int>;
DEFINE FIELD passBand ON assessment TYPE option<string>;
DEFINE FIELD depth ON assessment TYPE int DEFAULT 3;
DEFINE FIELD pageCap ON assessment TYPE int DEFAULT 100;
DEFINE FIELD pagesScanned ON assessment TYPE int DEFAULT 0;
DEFINE FIELD attempts ON assessment TYPE int DEFAULT 0;
DEFINE FIELD lastError ON assessment TYPE option<string>;
DEFINE FIELD findings ON assessment TYPE option<string> DEFAULT "";
DEFINE FIELD createdAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE INDEX assessment_status_created_idx ON assessment FIELDS status, createdAt;`,

  `DEFINE TABLE api_key SCHEMAFULL;
DEFINE FIELD name ON api_key TYPE string;
DEFINE FIELD keyHash ON api_key TYPE string;
DEFINE FIELD keyPrefix ON api_key TYPE string;
DEFINE FIELD rateLimit ON api_key TYPE int DEFAULT 60;
DEFINE FIELD status ON api_key TYPE string DEFAULT "active";
DEFINE FIELD expiresAt ON api_key TYPE option<datetime>;
DEFINE FIELD createdAt ON api_key TYPE datetime DEFAULT time::now();
DEFINE INDEX api_key_hash_idx ON api_key FIELDS keyHash UNIQUE;`,

  `DEFINE TABLE audit_log SCHEMAFULL;
DEFINE FIELD apiKeyId ON audit_log TYPE option<record<api_key>>;
DEFINE FIELD action ON audit_log TYPE string;
DEFINE FIELD resourceId ON audit_log TYPE option<string>;
DEFINE FIELD ip ON audit_log TYPE string;
DEFINE FIELD createdAt ON audit_log TYPE datetime DEFAULT time::now();
DEFINE INDEX audit_log_api_key_idx ON audit_log FIELDS apiKeyId, createdAt;`,
];
