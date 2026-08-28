import { getDb } from "./index";

// One-shot: drop the dead `magicLinkToken` field on `user_email`. The
// magic-link flow is now stateless (HMAC-signed, no DB storage), so the field
// added by migrate-auth-unification is never written. Clear any stray values
// first (SCHEMAFULL re-validates the whole record on UPDATE, so leftover data
// would block unrelated updates), then remove the field. Idempotent.
async function main() {
  const db = await getDb();
  await db
    .query("UPDATE user_email SET magicLinkToken = NONE WHERE magicLinkToken IS NOT NONE")
    .catch(() => {});
  await db.query("REMOVE FIELD magicLinkToken ON user_email;").catch(() => {});
  console.log("removed magicLinkToken field from user_email");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
