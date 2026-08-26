import { getDb } from "./index";

async function main() {
  const db = await getDb();
  await db.query("DEFINE FIELD OVERWRITE assessmentId ON evidence TYPE string").collect();
  console.log("OK: evidence.assessmentId -> string");
  process.exit(0);
}

main().catch((error) => {
  console.error("FAILED:", (error as Error).message);
  process.exit(1);
});
