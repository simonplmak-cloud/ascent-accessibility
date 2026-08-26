import { getDb } from "./index";

// Add the `detectedLanguages` field (JSON string of the page's detected
// language tags) to the assessment table. Idempotent — safe to run once against
// the live DB. No seed rows.
async function main() {
  const db = await getDb();
  await db.query(
    "DEFINE FIELD OVERWRITE detectedLanguages ON assessment TYPE option<string> DEFAULT NONE;",
  );
  console.log("detectedLanguages field added to assessment");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
