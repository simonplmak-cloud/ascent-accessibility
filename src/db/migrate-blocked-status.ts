import { getDb } from "./index";

// One-shot: add `blockReason` to the assessment record and widen `status` to
// include the `blocked` terminal state (bot/WAF protection rejected every page).
// The `status` field is plain `TYPE string` with no ASSERT, so no change is
// needed there beyond the code-level type union; `blockReason` is the new
// SCHEMAFULL field that must be defined before any write.
//
// Run from the worker box:
//   ssh wcag-workforce 'cd /opt/wcag-score && set -a && . ./.env && set +a && \
//     pnpm exec tsx src/db/migrate-blocked-status.ts'
async function main() {
  const db = await getDb();
  await db.query(
    "DEFINE FIELD OVERWRITE blockReason ON assessment TYPE option<string> DEFAULT NONE",
  );
  console.log("assessment.blockReason -> option<string> applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
