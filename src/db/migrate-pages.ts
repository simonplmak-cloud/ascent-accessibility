import { getDb } from "./index";

// Idempotent migration: persist the crawled sitemap URL list and the per-page
// scan metadata (title, status, wall-clock scan time) on the assessment record
// so the exported report can list every page that was scanned.
const STATEMENTS: string[] = [
  `DEFINE FIELD OVERWRITE sitemapUrls ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE pages ON assessment TYPE option<string>;`,
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
  console.log("Pages migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
