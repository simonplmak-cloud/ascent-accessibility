import { getDb } from "./index";

// Creates the `ai_sc_config` table (schema only — NO seed rows). Defaults live
// in code (`DEFAULT_AI_CONFIGS`); the DB stores only human-authored overrides.
async function main() {
  const db = await getDb();

  try {
    await db.query("DEFINE TABLE ai_sc_config SCHEMAFULL");
  } catch (error) {
    if (!/already exists/i.test(String((error as Error).message ?? error))) throw error;
  }

  const fields = [
    "DEFINE FIELD OVERWRITE sc ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE instructionId ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE modality ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE judgeable ON ai_sc_config TYPE bool DEFAULT false;",
    "DEFINE FIELD OVERWRITE instruction ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE whatToLookFor ON ai_sc_config TYPE option<string>;",
    "DEFINE FIELD OVERWRITE passRequires ON ai_sc_config TYPE option<string>;",
    "DEFINE FIELD OVERWRITE failRequires ON ai_sc_config TYPE option<string>;",
    "DEFINE FIELD OVERWRITE examples ON ai_sc_config TYPE option<string>;",
    "DEFINE FIELD OVERWRITE ruleId ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE description ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE recommendation ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE help ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE source ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE notes ON ai_sc_config TYPE string;",
    "DEFINE FIELD OVERWRITE settings ON ai_sc_config TYPE option<string>;",
    "DEFINE FIELD OVERWRITE enabled ON ai_sc_config TYPE bool DEFAULT true;",
    "DEFINE FIELD OVERWRITE updatedAt ON ai_sc_config TYPE datetime DEFAULT time::now();",
    "DEFINE INDEX OVERWRITE ai_sc_config_sc_idx ON ai_sc_config FIELDS sc UNIQUE;",
  ];
  for (const field of fields) {
    await db.query(field);
  }

  console.log("ai_sc_config table created (empty — no seed)");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
