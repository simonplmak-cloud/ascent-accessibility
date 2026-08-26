import { getDb } from "./index";

// Idempotent migration: adds an `html` column to the evidence table so full-page
// HTML snapshots are stored as their own (small, per-page) records instead of
// being inlined into the assessment's pageSnapshots JSON — which pushed the
// batched finalize UPDATE past SurrealDB's HTTP request size limit (413).
const STATEMENTS: string[] = [
  `DEFINE FIELD OVERWRITE html ON evidence TYPE option<string>;`,
];

async function main() {
  const db = await getDb();
  for (const statement of STATEMENTS) {
    try {
      await db.query(statement).collect();
      console.log("Applied:", statement.split("\n")[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/already exists/i.test(message)) {
        console.log("Skipped (already exists):", statement.split("\n")[0]);
        continue;
      }
      throw error;
    }
  }
  await db.close();
  console.log("Page snapshots migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
