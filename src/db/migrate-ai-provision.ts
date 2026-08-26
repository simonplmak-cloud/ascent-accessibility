import { getDb } from "./index";

// Provisioned AI: add the user fields (key kind, Stripe-funded balance, and the
// OpenRouter key hash) plus the `stripe_topup` idempotency table. Idempotent —
// safe to re-run (table creation swallows "already exists"; fields use OVERWRITE).
async function define(db: Awaited<ReturnType<typeof getDb>>, name: string, body: string) {
  try {
    await db.query(body.replaceAll("__T__", name));
  } catch (error) {
    if (!/already exists/i.test(String((error as Error).message ?? error))) throw error;
  }
}

async function main() {
  const db = await getDb();

  await db.query("DEFINE FIELD OVERWRITE aiKeyKind ON user TYPE option<string> DEFAULT NONE");
  await db.query("DEFINE FIELD OVERWRITE aiBalanceCents ON user TYPE option<int> DEFAULT 0");
  await db.query("DEFINE FIELD OVERWRITE openrouterKeyHash ON user TYPE option<string>");

  await define(
    db,
    "stripe_topup",
    `DEFINE TABLE __T__ SCHEMAFULL PERMISSIONS
      FOR select, create, update, delete NONE;`,
  );
  await db.query("DEFINE FIELD OVERWRITE sessionId ON stripe_topup TYPE string");
  await db.query("DEFINE FIELD OVERWRITE userId ON stripe_topup TYPE string");
  await db.query("DEFINE FIELD OVERWRITE amountCents ON stripe_topup TYPE int");
  await db.query("DEFINE FIELD OVERWRITE createdAt ON stripe_topup TYPE datetime DEFAULT time::now()");
  await db.query("DEFINE INDEX OVERWRITE stripe_topup_session_idx ON stripe_topup FIELDS sessionId UNIQUE");

  console.log("ai-provision migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
