import { getDb } from "./index";

// One-shot: add `standardLabel` to the assessment record — the localized display
// name of the standard the scan was run against (record keeping). Pre-existing
// records remain NONE; the UI falls back to resolving the id at render time.
async function main() {
  const db = await getDb();
  await db.query(
    "DEFINE FIELD OVERWRITE standardLabel ON assessment TYPE option<string> DEFAULT NONE",
  );
  console.log("assessment.standardLabel -> option<string> applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
