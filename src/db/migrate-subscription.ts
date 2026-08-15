import { getDb } from "./index";
async function main() {
  const db = await getDb();
  await db.query(`DEFINE TABLE subscription SCHEMAFULL;
DEFINE FIELD userId ON subscription TYPE string;
DEFINE FIELD status ON subscription TYPE string DEFAULT "inactive";
DEFINE FIELD stripeCustomerId ON subscription TYPE option<string>;
DEFINE FIELD stripeSubscriptionId ON subscription TYPE option<string>;
DEFINE FIELD createdAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE FIELD updatedAt ON subscription TYPE datetime DEFAULT time::now();
DEFINE INDEX subscription_user_idx ON subscription FIELDS userId UNIQUE;`).collect();
  console.log("OK: subscription table created");
  process.exit(0);
}
main().catch((e) => { console.error("FAILED:", (e as Error).message); process.exit(1); });
