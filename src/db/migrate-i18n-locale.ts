import { getDb } from "./index";

// One-shot: add `locale` to the assessment record so the worker can localize
// AI reasoning + scan-log text for new scans. Pre-existing records remain NONE
// (treated as "en"). Idempotent — safe to run once against the live DB.
async function main() {
  const db = await getDb();
  await db.query(
    "DEFINE FIELD OVERWRITE locale ON assessment TYPE option<string> DEFAULT NONE",
  );
  console.log("assessment.locale -> option<string> applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
