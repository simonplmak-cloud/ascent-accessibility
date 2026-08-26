import { getDb } from "./index";

// One-shot: `snapshotAt` was declared `option<datetime>` but the worker writes
// an ISO string, so every assessment failed SCHEMAFULL coercion at finalize.
// Align the live field with the code (string).
async function main() {
  const db = await getDb();
  await db.query(
    "DEFINE FIELD OVERWRITE snapshotAt ON assessment TYPE option<string>",
  );
  console.log("snapshotAt -> option<string> applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
