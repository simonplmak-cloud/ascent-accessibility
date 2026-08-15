import { getDb } from "./index";

// Non-idempotent one-shot additions applied to an existing deployment.
// For idempotent field changes use DEFINE FIELD OVERWRITE (see statements).
const LIVE_STATEMENTS: string[] = [
  `DEFINE TABLE evidence SCHEMAFULL;
DEFINE FIELD assessmentId ON evidence TYPE record<assessment>;
DEFINE FIELD pageUrl ON evidence TYPE string;
DEFINE FIELD kind ON evidence TYPE string;
DEFINE FIELD image ON evidence TYPE string;
DEFINE FIELD mime ON evidence TYPE string;
DEFINE FIELD createdAt ON evidence TYPE datetime DEFAULT time::now();
DEFINE INDEX evidence_assessment_idx ON evidence FIELDS assessmentId;`,
  `DEFINE FIELD OVERWRITE comparison ON assessment TYPE option<string> DEFAULT "";`,
  `DEFINE TABLE subscription SCHEMAFULL;
DEFINE FIELD userId ON subscription TYPE string;
DEFINE FIELD status ON subscription TYPE string DEFAULT "inactive";
DEFINE FIELD stripeCustomerId ON subscription TYPE option<string>;
DEFINE FIELD stripeSubscriptionId ON subscription TYPE option<string>;
DEFINE FIELD createdAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE INDEX subscription_user_idx ON subscription FIELDS userId UNIQUE;`,
];

async function main() {
  const db = await getDb();
  for (const statement of LIVE_STATEMENTS) {
    await db.query(statement).collect();
    console.log("Applied:", statement.split("\n")[0]);
  }
  console.log("Live migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
