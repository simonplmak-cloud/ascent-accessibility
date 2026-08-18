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
DEFINE FIELD OVERWRITE snapshotAt ON assessment TYPE option<datetime>;
DEFINE FIELD OVERWRITE pageSnapshots ON assessment TYPE option<string>;
DEFINE FIELD OVERWRITE role ON user TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE verified ON user TYPE bool DEFAULT false;
DEFINE FIELD OVERWRITE googleSub ON user TYPE option<string>;
DEFINE FIELD OVERWRITE emailVerificationToken ON user TYPE option<string>;
DEFINE FIELD OVERWRITE passkeys ON user TYPE option<string>;
DEFINE FIELD OVERWRITE qwenApiKey ON user TYPE option<string>;
DEFINE INDEX OVERWRITE user_google_sub_idx ON user FIELDS googleSub UNIQUE;`,
  `DEFINE ACCESS user_google ON DATABASE TYPE RECORD OVERWRITE
  SIGNUP (
    CREATE user CONTENT {
      name: $name,
      email: $email,
      password: crypto::argon2::generate($password),
      googleSub: $googleSub,
      verified: true
    }
  )
  SIGNIN (
    SELECT * FROM user WHERE googleSub = $googleSub
  )
  DURATION FOR SESSION 24h;`,
];

async function main() {
  const db = await getDb();
  for (const statement of STATEMENTS) {
    await db.query(statement).collect();
    console.log("Applied:", statement.split("\n")[0]);
  }
  await db.close();
  console.log("Conformance migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
