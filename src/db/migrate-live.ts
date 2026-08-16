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

  `DEFINE TABLE user SCHEMAFULL PERMISSIONS
  FOR select WHERE id = $auth.id
  FOR create, update, delete NONE;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD email ON user TYPE string;
DEFINE FIELD password ON user TYPE string PERMISSIONS FOR select NONE;
DEFINE FIELD createdAt ON user TYPE datetime DEFAULT time::now();
DEFINE INDEX user_email_idx ON user FIELDS email UNIQUE;`,

  `DEFINE ACCESS user ON DATABASE TYPE RECORD
  SIGNUP (
    CREATE user CONTENT {
      name: $name,
      email: $email,
      password: crypto::argon2::generate($password)
    }
  )
  SIGNIN (
    SELECT * FROM user WHERE email = $email
      AND crypto::argon2::compare(password, $password)
  )
  DURATION FOR SESSION 24h;`,

  `DEFINE TABLE subscription PERMISSIONS
  FOR select WHERE userId = type::string($auth.id)
  FOR create, update, delete NONE;`,

  `DEFINE TABLE rate_limit SCHEMAFULL;
DEFINE FIELD key ON rate_limit TYPE string;
DEFINE FIELD windowStart ON rate_limit TYPE int;
DEFINE FIELD count ON rate_limit TYPE int DEFAULT 0;
DEFINE INDEX rate_limit_key_window_idx ON rate_limit FIELDS key, windowStart UNIQUE;`,
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
