import { getDb } from "./index";

// One-shot migration for the auth-unification model: create the linked-identity
// tables, backfill from the old single-field user model, remap assessment
// ownership to account IDs, and drop the old fields + record-access methods.
async function main() {
  const db = await getDb();

  // 1. Create the new tables (idempotent).
  const createTables = [
    `DEFINE TABLE user_email SCHEMAFULL PERMISSIONS
      FOR select WHERE user = $auth.id
      FOR create, update, delete NONE;
     DEFINE FIELD user ON user_email TYPE record<user>;
     DEFINE FIELD email ON user_email TYPE string;
     DEFINE FIELD verified ON user_email TYPE bool DEFAULT false;
     DEFINE FIELD primary ON user_email TYPE bool DEFAULT false;
     DEFINE FIELD magicLinkToken ON user_email TYPE option<string>;
     DEFINE FIELD createdAt ON user_email TYPE datetime DEFAULT time::now();
     DEFINE INDEX user_email_email_idx ON user_email FIELDS email UNIQUE;
     DEFINE INDEX user_email_user_idx ON user_email FIELDS user;`,
    `DEFINE TABLE user_oauth_link SCHEMAFULL PERMISSIONS
      FOR select WHERE user = $auth.id
      FOR create, update, delete NONE;
     DEFINE FIELD user ON user_oauth_link TYPE record<user>;
     DEFINE FIELD provider ON user_oauth_link TYPE string;
     DEFINE FIELD subject ON user_oauth_link TYPE string;
     DEFINE FIELD createdAt ON user_oauth_link TYPE datetime DEFAULT time::now();
     DEFINE INDEX user_oauth_link_provider_subject_idx ON user_oauth_link FIELDS provider, subject UNIQUE;
     DEFINE INDEX user_oauth_link_user_idx ON user_oauth_link FIELDS user;`,
  ];
  for (const statement of createTables) {
    try {
      await db.query(statement).collect();
      console.log("Created table:", (statement.split("\n")[0] ?? "").split(" ").slice(0, 3).join(" "));
    } catch (error) {
      if (/already exists/i.test(String(error))) continue;
      throw error;
    }
  }

  // 2. Backfill emails + OAuth links from the old single-field model.
  const usersResult = (await db
    .query("SELECT id, email, verified, googleSub, oauthSubject FROM user")
    .json()
    .collect()) as unknown[];
  const users = (usersResult[0] as Array<Record<string, unknown>> | undefined) ?? [];

  for (const u of users) {
    const id = String(u.id);
    const email = typeof u.email === "string" ? u.email : null;
    const verified = u.verified === true;

    if (email) {
      await db
        .query(
          "CREATE user_email CONTENT { user: type::record($id), email: $email, verified: $verified, primary: true }",
          { id, email, verified },
        )
        .collect()
        .catch(() => {});
    }
    if (typeof u.googleSub === "string") {
      await db
        .query(
          "CREATE user_oauth_link CONTENT { user: type::record($id), provider: 'google', subject: $s }",
          { id, s: u.googleSub },
        )
        .collect()
        .catch(() => {});
    }
    if (typeof u.oauthSubject === "string" && u.oauthSubject.includes(":")) {
      const idx = u.oauthSubject.indexOf(":");
      const provider = u.oauthSubject.slice(0, idx);
      const subject = u.oauthSubject.slice(idx + 1);
      if (provider && subject) {
        await db
          .query(
            "CREATE user_oauth_link CONTENT { user: type::record($id), provider: $p, subject: $s }",
            { id, p: provider, s: subject },
          )
          .collect()
          .catch(() => {});
      }
    }
  }
  console.log(`Backfilled ${users.length} user(s)`);

  // 3. Remap assessment.ownerId from email to account id.
  const assessmentsResult = (await db
    .query("SELECT id, ownerId FROM assessment WHERE ownerId != NONE")
    .json()
    .collect()) as unknown[];
  const assessments = (assessmentsResult[0] as Array<Record<string, unknown>> | undefined) ?? [];

  let remapped = 0;
  for (const a of assessments) {
    const ownerId = typeof a.ownerId === "string" ? a.ownerId : null;
    if (!ownerId || ownerId.startsWith("user:")) continue;
    const emailRows = (await db
      .query("SELECT user FROM user_email WHERE email = $email LIMIT 1", { email: ownerId })
      .json()
      .collect()) as unknown[];
    const account = (emailRows[0] as Array<{ user: string }> | undefined)?.[0]?.user;
    if (account) {
      await db
        .query("UPDATE assessment SET ownerId = $owner WHERE id = type::record($id)", {
          id: String(a.id),
          owner: account,
        })
        .collect()
        .catch(() => {});
      remapped += 1;
    }
  }
  console.log(`Remapped ${remapped} assessment(s) to account ownership`);

  // 4. Drop old fields, indexes, and access methods.
  const drops = [
    "REMOVE FIELD email ON user;",
    "REMOVE FIELD password ON user;",
    "REMOVE FIELD verified ON user;",
    "REMOVE FIELD googleSub ON user;",
    "REMOVE FIELD oauthSubject ON user;",
    "REMOVE FIELD emailVerificationToken ON user;",
    "REMOVE FIELD magicLinkToken ON user;",
    "REMOVE FIELD passkeys ON user;",
    "REMOVE INDEX user_email_idx ON user;",
    "REMOVE INDEX user_google_sub_idx ON user;",
    "REMOVE ACCESS user ON DATABASE;",
    "REMOVE ACCESS user_google ON DATABASE;",
    "REMOVE ACCESS user_oauth ON DATABASE;",
    "REMOVE ACCESS user_magic ON DATABASE;",
  ];
  for (const drop of drops) {
    await db.query(drop).collect().catch(() => {});
  }
  console.log("Dropped old fields, indexes, and access methods");

  await db.close();
  console.log("Auth unification migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
