# API Contracts

## POST /api/v1/assessments (modified)
Order: rate-limit → daily-limit → quota-check → pre-estimate → SSRF → queue-depth → create.

New error response (before queueing):
```
409 { "code": "STORAGE_QUOTA_EXCEEDED", "usedBytes": number, "quotaBytes": number }
```

## GET /api/v1/account/usage (new)
Auth: session or API key (owner-gated).
```
200 { "usedBytes": number, "quotaBytes": number, "retentionDays": number }
401 { "code": "UNAUTHORIZED" }
```

## GET /api/v1/health (new, public)
```
200 { "storageBytes": number, "queueDepth": number, "failedScans24h": number, "updatedAt": string }
```
No secrets or PII.

## DELETE /api/v1/assessments/[id] (modified)
Auth: owner-gated (currently unauthenticated — fixed).
Cascades `evidence` + `report_pdf` + `assessment`.
```
200 { "ok": true }
401 { "code": "UNAUTHORIZED" }
404 { "code": "NOT_FOUND" }
```

## GET /api/v1/assessments/[id]/export (modified)
Public (shareable). `runtime=nodejs`, `maxDuration=60`, `dynamic=force-dynamic`.
Serve stored `report_pdf` when present; else render-on-demand (IP-rate-limited).
Headers: `Content-Type: application/pdf`, `Content-Disposition: attachment`.
```
200 (PDF bytes)
409 { "code": "CONFLICT", "status": assessment.status }  // not completed
404 { "code": "NOT_FOUND" }
429 { "code": "RATE_LIMITED" }  // on-demand fallback only
```

## Worker cleanup sweep (internal)
- Reports: delete assessment+evidence+report_pdf where `updatedAt < now - 180d` and status in (completed, failed).
- `audit_log`: purge by age AND `apiKeyId IN <purgedKeys>`.
- `api_key`: purge expired/revoked.
- `user_email.magicLinkToken`: clear tokens older than TTL.
- `WORKER_CLEANUP_DRY_RUN=1` → log-only.
