import { getDb } from "./index";
import { SCHEMA_STATEMENTS } from "./schema";

async function main() {
  const db = await getDb();
  for (const statement of SCHEMA_STATEMENTS) {
    await db.query(statement).collect();
    console.log("Applied:", statement.split("\n")[0]);
  }
  console.log("Schema migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
