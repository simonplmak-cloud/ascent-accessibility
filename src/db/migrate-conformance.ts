import { getDb } from "./index";

// Idempotent, re-runnable migration for the WCAG conformance-evaluation and
// human-review fields. Unlike migrate-live.ts (one-shot table creation), these
// are DEFINE FIELD OVERWRITE statements so they can run against an existing
// deployment without failing on "already exists".
const STATEMENTS: string[] = [
  `DEFINE FIELD OVERWRITE conformance ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE scsMet ON assessment TYPE option<int>;
DEFINE FIELD OVERWRITE scsApplicable ON assessment TYPE option<int>;
DEFINE FIELD OVERWRITE reviewStatus ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE reviewClaim ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE reviewResults ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE snapshotAt ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE pageSnapshots ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE role ON user TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE aiApiKey ON user TYPE option<string>;
DEFINE FIELD OVERWRITE aiProvider ON user TYPE option<string> DEFAULT "openrouter";
DEFINE FIELD OVERWRITE aiBaseUrl ON user TYPE option<string>;
DEFINE FIELD OVERWRITE aiVisionModel ON user TYPE option<string>;
DEFINE FIELD OVERWRITE aiAudioModel ON user TYPE option<string>;`,
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
  console.log("Conformance migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
