import { getDb } from "./index";

// One-shot: clear orphaned legacy `user` fields left behind by auth-unification.
// `REMOVE FIELD` removes the schema but NOT the data — on a SCHEMAFULL table the
// leftover values then fail every UPDATE ("Found field 'x', but no such field
// exists"). Setting them to NONE (or UNSET) clears the data. Real emails live in
// `user_email` and are untouched. Idempotent (no-op on already-clean records).
async function main() {
  const db = await getDb();
  await db.query(
    "UPDATE user SET email = NONE, password = NONE, verified = NONE, googleSub = NONE, oauthSubject = NONE, emailVerificationToken = NONE, magicLinkToken = NONE, passkeys = NONE",
  );
  console.log("stale user fields cleaned");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
