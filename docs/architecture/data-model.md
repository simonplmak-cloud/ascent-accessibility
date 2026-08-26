# Data model

SurrealDB (`SCHEMAFULL`), namespace `wcag-score`, database `main`. Three tables today plus a
fourth (`evidence`) introduced by the audit-report feature.

## `assessment`

| Field | Type | Notes |
|---|---|---|
| `url` | `string` | target URL |
| `standard` | `string` | e.g. `wcag22aa` |
| `status` | `string` | `queued → running → completed/failed` — this **is** the queue |
| `partial` | `bool` | crawl cap reached |
| `score` | `option<int>` | 0–100 |
| `passBand` | `option<string>` | `pass`/`partial`/`fail` |
| `depth` / `pageCap` | `int` | crawl limits |
| `pagesScanned` | `int` | pages actually scanned |
| `attempts` | `int` | retry counter |
| `lastError` | `option<string>` | |
| `findings` | `option<string>` | **JSON string** of `Finding[]` (see below) |
| `log` | `option<string>` | **JSON string** of `LogEntry[]` |
| `comparison` | `option<string>` | **JSON string** of `ComparisonData` (see below) |
| `createdAt` / `updatedAt` | `datetime` | |

Index: `assessment_status_created_idx ON (status, createdAt)`.

## Finding (stored as JSON in `assessment.findings`)

```ts
{
  ruleId: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
  help: string;
  helpUrl: string;
  wcagSc: string[];                  // e.g. ["1.4.3"]
  wcagLevel: "A" | "AA" | "AAA" | null;
  scTitle: string;
  confidence: "confirmed" | "single-source";
  sources: Array<{ tool: "axe" | "lighthouse" | "ibm"; ruleId: string; impact: string; message: string }>;
  instances: Array<{ target: string; html: string; failureSummary: string; evidenceId: string | null }>;
}
```

`findings` and `log` are JSON strings because **SurrealDB `SCHEMAFULL` cannot bind arrays of
objects** (`SET field = $arrayOfObjects` throws `Found field '…[i].field'`).

## ComparisonData (stored as JSON in `assessment.comparison`)

```ts
{
  lighthouse: { score: number; failedAudits: Array<{ id: string; weight: number }> };
  ibm: { violation: number; potentialViolation: number; recommendation: number; pass: number; manual: number };
  conformance: {
    total: number; passed: number; failed: number; notTested: number;
    levelAttained: "A" | "AA" | "AAA" | "none";
    rows: Array<{ num: string; title: string; level: string; result: "pass" | "fail" | "not-tested" }>;
  };
}
```

## `evidence`

Screenshot bytes for report evidence. Served by
`GET /api/v1/assessments/:id/evidence/:evidenceId`.

| Field | Type | Notes |
|---|---|---|
| `assessmentId` | `record<assessment>` | owning assessment |
| `pageUrl` | `string` | page the shot belongs to |
| `kind` | `string` | `page` (full-page) or `element` |
| `image` | `string` | base64-encoded image |
| `mime` | `string` | `image/jpeg` or `image/png` |
| `createdAt` | `datetime` | |

Index: `evidence_assessment_idx ON (assessmentId)`.

## `api_key` and `audit_log`

`api_key`: `name`, `keyHash` (SHA-256, unique index), `keyPrefix`, `rateLimit`, `status`
(`active`/`revoked`), `expiresAt`. `audit_log`: `apiKeyId`, `action`, `resourceId`, `ip`,
`createdAt`. Raw keys are **never stored** — only the hash.
