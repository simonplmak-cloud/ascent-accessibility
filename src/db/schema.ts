import type { Impact, ConformanceOutcome } from "@/lib/scoring";

export type AssessmentStatus = "queued" | "running" | "completed" | "failed";
export type PassBand = "pass" | "partial" | "fail";
export type ApiKeyStatus = "active" | "revoked";
export type FindingConfidence = "confirmed" | "single-source";

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
  impact: Impact;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
  help: string;
  helpUrl: string;
  wcagSc: string[];
  wcagLevel: "A" | "AA" | "AAA" | null;
  scTitle: string;
  confidence: FindingConfidence;
  sources: FindingSource[];
  instances: FindingInstance[];
}

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface Assessment {
  id: string;
  url: string;
  standard: string;
  status: AssessmentStatus;
  partial: boolean;
  score: number | null;
  passBand: PassBand | null;
  conformance: ConformanceOutcome | null;
  scsMet: number | null;
  scsApplicable: number | null;
  reviewStatus: string | null;
  reviewClaim: string | null;
  reviewResults: string | null;
  snapshotAt: string | null;
  pageSnapshots: string | null;
  depth: number;
  pageCap: number;
  pagesScanned: number;
  attempts: number;
  lastError: string | null;
  findings: Finding[];
  log: LogEntry[];
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewAssessment {
  url: string;
  standard: string;
  depth?: number;
  pageCap?: number;
  ownerId?: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  rateLimit: number;
  status: ApiKeyStatus;
  userId: string | null;
  expiresAt: Date | null;
  createdAt: string;
}

export interface NewApiKey {
  name: string;
  keyHash: string;
  keyPrefix: string;
  rateLimit: number;
  userId: string | null;
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

export interface Evidence {
  id: string;
  assessmentId: string;
  pageUrl: string;
  kind: "page" | "element";
  image: string;
  mime: string;
  createdAt: string;
}

export interface NewEvidence {
  assessmentId: string;
  pageUrl: string;
  kind: "page" | "element";
  image: string;
  mime: string;
}

export type SubscriptionStatus = "active" | "inactive";

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SCHEMA_STATEMENTS: string[] = [
  `DEFINE TABLE assessment SCHEMAFULL;
DEFINE FIELD url ON assessment TYPE string;
DEFINE FIELD standard ON assessment TYPE string;
DEFINE FIELD status ON assessment TYPE string DEFAULT "queued";
DEFINE FIELD partial ON assessment TYPE bool DEFAULT false;
DEFINE FIELD score ON assessment TYPE option<int>;
DEFINE FIELD passBand ON assessment TYPE option<string>;
DEFINE FIELD conformance ON assessment TYPE option<string>;
DEFINE FIELD scsMet ON assessment TYPE option<int>;
DEFINE FIELD scsApplicable ON assessment TYPE option<int>;
DEFINE FIELD reviewStatus ON assessment TYPE option<string>;
DEFINE FIELD reviewClaim ON assessment TYPE option<string>;
DEFINE FIELD reviewResults ON assessment TYPE option<string>;
DEFINE FIELD snapshotAt ON assessment TYPE option<string>;
DEFINE FIELD pageSnapshots ON assessment TYPE option<string>;
DEFINE FIELD depth ON assessment TYPE int DEFAULT 3;
DEFINE FIELD pageCap ON assessment TYPE int DEFAULT 100;
DEFINE FIELD pagesScanned ON assessment TYPE int DEFAULT 0;
DEFINE FIELD attempts ON assessment TYPE int DEFAULT 0;
DEFINE FIELD lastError ON assessment TYPE option<string>;
DEFINE FIELD findings ON assessment TYPE option<string> DEFAULT "";
DEFINE FIELD log ON assessment TYPE option<string> DEFAULT "";
DEFINE FIELD comparison ON assessment TYPE option<string> DEFAULT "";
DEFINE FIELD ownerId ON assessment TYPE option<string> DEFAULT NONE;
DEFINE FIELD createdAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON assessment TYPE datetime DEFAULT time::now();
DEFINE INDEX assessment_status_created_idx ON assessment FIELDS status, createdAt;
DEFINE INDEX assessment_owner_created_idx ON assessment FIELDS ownerId, createdAt;`,

  `DEFINE TABLE api_key SCHEMAFULL;
DEFINE FIELD name ON api_key TYPE string;
DEFINE FIELD keyHash ON api_key TYPE string;
DEFINE FIELD keyPrefix ON api_key TYPE string;
DEFINE FIELD rateLimit ON api_key TYPE int DEFAULT 60;
DEFINE FIELD status ON api_key TYPE string DEFAULT "active";
DEFINE FIELD userId ON api_key TYPE option<string> DEFAULT NONE;
DEFINE FIELD expiresAt ON api_key TYPE option<datetime>;
DEFINE FIELD createdAt ON api_key TYPE datetime DEFAULT time::now();
DEFINE INDEX api_key_hash_idx ON api_key FIELDS keyHash UNIQUE;
DEFINE INDEX api_key_user_idx ON api_key FIELDS userId;`,

  `DEFINE TABLE audit_log SCHEMAFULL;
DEFINE FIELD apiKeyId ON audit_log TYPE option<record<api_key>>;
DEFINE FIELD action ON audit_log TYPE string;
DEFINE FIELD resourceId ON audit_log TYPE option<string>;
DEFINE FIELD ip ON audit_log TYPE string;
DEFINE FIELD createdAt ON audit_log TYPE datetime DEFAULT time::now();
DEFINE INDEX audit_log_api_key_idx ON audit_log FIELDS apiKeyId, createdAt;`,

  `DEFINE TABLE evidence SCHEMAFULL;
DEFINE FIELD assessmentId ON evidence TYPE string;
DEFINE FIELD pageUrl ON evidence TYPE string;
DEFINE FIELD kind ON evidence TYPE string;
DEFINE FIELD image ON evidence TYPE string;
DEFINE FIELD mime ON evidence TYPE string;
DEFINE FIELD createdAt ON evidence TYPE datetime DEFAULT time::now();
DEFINE INDEX evidence_assessment_idx ON evidence FIELDS assessmentId;`,

  `DEFINE TABLE subscription SCHEMAFULL;
DEFINE FIELD userId ON subscription TYPE string;
DEFINE FIELD status ON subscription TYPE string DEFAULT "inactive";
DEFINE FIELD stripeCustomerId ON subscription TYPE option<string>;
DEFINE FIELD stripeSubscriptionId ON subscription TYPE option<string>;
DEFINE FIELD createdAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE INDEX subscription_user_idx ON subscription FIELDS userId UNIQUE;`,

  `DEFINE TABLE user SCHEMAFULL PERMISSIONS
  FOR select WHERE id = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD role ON user TYPE option<string> DEFAULT NONE;
DEFINE FIELD aiApiKey ON user TYPE option<string>;
DEFINE FIELD aiProvider ON user TYPE option<string> DEFAULT "openrouter";
DEFINE FIELD aiBaseUrl ON user TYPE option<string>;
DEFINE FIELD aiVisionModel ON user TYPE option<string>;
DEFINE FIELD aiAudioModel ON user TYPE option<string>;
DEFINE FIELD createdAt ON user TYPE datetime DEFAULT time::now();`,

  `DEFINE TABLE user_email SCHEMAFULL PERMISSIONS
  FOR select WHERE user = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD user ON user_email TYPE record<user>;
DEFINE FIELD email ON user_email TYPE string;
DEFINE FIELD verified ON user_email TYPE bool DEFAULT false;
DEFINE FIELD primary ON user_email TYPE bool DEFAULT false;
DEFINE FIELD magicLinkToken ON user_email TYPE option<string>;
DEFINE FIELD createdAt ON user_email TYPE datetime DEFAULT time::now();
DEFINE INDEX user_email_email_idx ON user_email FIELDS email UNIQUE;
DEFINE INDEX user_email_user_idx ON user_email FIELDS user;`,

  `DEFINE TABLE user_oauth_link SCHEMAFULL PERMISSIONS
  FOR select WHERE user = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD user ON user_oauth_link TYPE record<user>;
DEFINE FIELD provider ON user_oauth_link TYPE string;
DEFINE FIELD subject ON user_oauth_link TYPE string;
DEFINE FIELD createdAt ON user_oauth_link TYPE datetime DEFAULT time::now();
DEFINE INDEX user_oauth_link_provider_subject_idx ON user_oauth_link FIELDS provider, subject UNIQUE;
DEFINE INDEX user_oauth_link_user_idx ON user_oauth_link FIELDS user;`,

  `DEFINE TABLE subscription PERMISSIONS
  FOR select WHERE userId = type::string($auth.id)
  FOR create, update, delete NONE;`,

  `DEFINE TABLE rate_limit SCHEMAFULL;
DEFINE FIELD key ON rate_limit TYPE string;
DEFINE FIELD windowStart ON rate_limit TYPE int;
DEFINE FIELD count ON rate_limit TYPE int DEFAULT 0;
DEFINE INDEX rate_limit_key_window_idx ON rate_limit FIELDS key, windowStart UNIQUE;`,

  `DEFINE TABLE ai_sc_config SCHEMAFULL;
DEFINE FIELD sc ON ai_sc_config TYPE string;
DEFINE FIELD instructionId ON ai_sc_config TYPE string;
DEFINE FIELD modality ON ai_sc_config TYPE string;
DEFINE FIELD judgeable ON ai_sc_config TYPE bool DEFAULT false;
DEFINE FIELD instruction ON ai_sc_config TYPE string;
DEFINE FIELD whatToLookFor ON ai_sc_config TYPE option<string>;
DEFINE FIELD passRequires ON ai_sc_config TYPE option<string>;
DEFINE FIELD failRequires ON ai_sc_config TYPE option<string>;
DEFINE FIELD examples ON ai_sc_config TYPE option<string>;
DEFINE FIELD ruleId ON ai_sc_config TYPE string;
DEFINE FIELD description ON ai_sc_config TYPE string;
DEFINE FIELD recommendation ON ai_sc_config TYPE string;
DEFINE FIELD help ON ai_sc_config TYPE string;
DEFINE FIELD source ON ai_sc_config TYPE string;
DEFINE FIELD notes ON ai_sc_config TYPE string;
DEFINE FIELD settings ON ai_sc_config TYPE option<string>;
DEFINE FIELD enabled ON ai_sc_config TYPE bool DEFAULT true;
DEFINE FIELD updatedAt ON ai_sc_config TYPE datetime DEFAULT time::now();
DEFINE INDEX ai_sc_config_sc_idx ON ai_sc_config FIELDS sc UNIQUE;`,

  // Training: progress + credentials. Curriculum (paths/modules/lessons/quizzes)
  // lives in code; only per-learner state is persisted here.
  `DEFINE TABLE learner_progress SCHEMAFULL PERMISSIONS
  FOR select WHERE user = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD user ON learner_progress TYPE record<user>;
DEFINE FIELD path ON learner_progress TYPE string;
DEFINE FIELD activity ON learner_progress TYPE string;
DEFINE FIELD status ON learner_progress TYPE string DEFAULT "not_started";
DEFINE FIELD score ON learner_progress TYPE option<int>;
DEFINE FIELD attempts ON learner_progress TYPE int DEFAULT 0;
DEFINE FIELD lastPosition ON learner_progress TYPE option<string>;
DEFINE FIELD startedAt ON learner_progress TYPE option<datetime>;
DEFINE FIELD completedAt ON learner_progress TYPE option<datetime>;
DEFINE FIELD updatedAt ON learner_progress TYPE datetime DEFAULT time::now();
DEFINE INDEX learner_progress_user_activity_idx ON learner_progress FIELDS user, activity UNIQUE;`,

  `DEFINE TABLE credential SCHEMAFULL PERMISSIONS
  FOR select WHERE user = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD user ON credential TYPE record<user>;
DEFINE FIELD path ON credential TYPE string;
DEFINE FIELD pathVersion ON credential TYPE string;
DEFINE FIELD score ON credential TYPE option<int>;
DEFINE FIELD completedAt ON credential TYPE datetime;
DEFINE FIELD issuedAt ON credential TYPE datetime DEFAULT time::now();
DEFINE INDEX credential_user_path_idx ON credential FIELDS user, path UNIQUE;`,
];
