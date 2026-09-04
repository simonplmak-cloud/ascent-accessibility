import { getDb } from "./index";

// One-shot: purge "CannotTell" from the stored `comparison` JSON of completed
// assessments. No AI re-evaluation is performed — unresolved criteria are
// honestly relabelled "NotTested" ("no AI testing was run"), and the legacy
// reason taxonomy is dropped. Idempotent: re-running is a no-op.
//
// Run from the worker box:
//   ssh wcag-workforce 'cd /opt/wcag-score && set -a && . ./.env && set +a && \
//     pnpm exec tsx src/db/migrate-cannottell-zero.ts'

function rewrite(raw: unknown): { json: string; changed: boolean } {
  if (typeof raw !== "string" || raw.length === 0) return { json: raw as string, changed: false };
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { json: raw, changed: false };
  }
  let changed = false;

  const conformance = data.conformance as Record<string, unknown> | undefined;
  if (conformance && typeof conformance === "object") {
    if ("cannotTell" in conformance) {
      conformance.notTested = conformance.cannotTell;
      delete conformance.cannotTell;
      changed = true;
    }
    for (const row of (conformance.rows as Array<Record<string, unknown>>) ?? []) {
      if (row.result === "CannotTell") {
        row.result = "NotTested";
        changed = true;
      }
      if ("reviewReason" in row) {
        delete row.reviewReason;
        changed = true;
      }
    }
  }

  const ai = data.ai as { verdicts?: Array<Record<string, unknown>> } | undefined;
  for (const v of ai?.verdicts ?? []) {
    if (v.verdict === "CannotTell") {
      v.verdict = "NotTested";
      changed = true;
    }
  }

  return { json: changed ? JSON.stringify(data) : raw, changed };
}

async function main() {
  const db = await getDb();
  const result = await db.query("SELECT id, comparison FROM assessment WHERE status = 'completed'");
  const list = (result[0] as unknown[]) ?? [];

  let updated = 0;
  let unchanged = 0;
  for (const item of list) {
    const rec = item as { id: string; comparison: string | null };
    const { json, changed } = rewrite(rec.comparison);
    if (!changed) {
      unchanged += 1;
      continue;
    }
    await db.query("UPDATE assessment SET comparison = $c WHERE id = type::record($id)", {
      id: rec.id,
      c: json,
    });
    updated += 1;
  }
  console.log(`cannottell-zero migration: ${updated} updated, ${unchanged} unchanged`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
