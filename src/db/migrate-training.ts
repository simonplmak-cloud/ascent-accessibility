import { getDb } from "./index";

// Creates the training tables (schema only — NO seed). Curriculum content lives
// in code; only learner progress + credentials are persisted.
async function define(db: Awaited<ReturnType<typeof getDb>>, name: string, body: string) {
  try {
    await db.query(body.replaceAll("__T__", name));
  } catch (error) {
    if (!/already exists/i.test(String((error as Error).message ?? error))) throw error;
  }
}

async function main() {
  const db = await getDb();

  await define(
    db,
    "learner_progress",
    `DEFINE TABLE __T__ SCHEMAFULL PERMISSIONS
      FOR select WHERE user = $auth.id
      FOR create, update, delete NONE;`,
  );
  const progressFields = [
    "DEFINE FIELD OVERWRITE user ON learner_progress TYPE record<user>;",
    "DEFINE FIELD OVERWRITE path ON learner_progress TYPE string;",
    "DEFINE FIELD OVERWRITE activity ON learner_progress TYPE string;",
    "DEFINE FIELD OVERWRITE status ON learner_progress TYPE string DEFAULT 'not_started';",
    "DEFINE FIELD OVERWRITE score ON learner_progress TYPE option<int>;",
    "DEFINE FIELD OVERWRITE attempts ON learner_progress TYPE int DEFAULT 0;",
    "DEFINE FIELD OVERWRITE lastPosition ON learner_progress TYPE option<string>;",
    "DEFINE FIELD OVERWRITE startedAt ON learner_progress TYPE option<datetime>;",
    "DEFINE FIELD OVERWRITE completedAt ON learner_progress TYPE option<datetime>;",
    "DEFINE FIELD OVERWRITE updatedAt ON learner_progress TYPE datetime DEFAULT time::now();",
    "DEFINE INDEX OVERWRITE learner_progress_user_activity_idx ON learner_progress FIELDS user, activity UNIQUE;",
  ];
  for (const field of progressFields) await db.query(field);

  await define(
    db,
    "credential",
    `DEFINE TABLE __T__ SCHEMAFULL PERMISSIONS
      FOR select WHERE user = $auth.id
      FOR create, update, delete NONE;`,
  );
  const credentialFields = [
    "DEFINE FIELD OVERWRITE user ON credential TYPE record<user>;",
    "DEFINE FIELD OVERWRITE path ON credential TYPE string;",
    "DEFINE FIELD OVERWRITE pathVersion ON credential TYPE string;",
    "DEFINE FIELD OVERWRITE score ON credential TYPE option<int>;",
    "DEFINE FIELD OVERWRITE completedAt ON credential TYPE datetime;",
    "DEFINE FIELD OVERWRITE issuedAt ON credential TYPE datetime DEFAULT time::now();",
    "DEFINE INDEX OVERWRITE credential_user_path_idx ON credential FIELDS user, path UNIQUE;",
  ];
  for (const field of credentialFields) await db.query(field);

  console.log("training tables created (empty — no seed)");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
