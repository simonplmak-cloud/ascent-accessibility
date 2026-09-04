import { getDb } from "./index";

// One-shot: add latency/count fields to the `metrics` table (SCHEMAFULL) so the
// worker can persist p50/p95/p99 and scan/failure counters for the Prometheus
// metrics endpoint. Run from the worker box:
//   ssh wcag-workforce 'cd /opt/wcag-score && set -a && . ./.env && set +a && \
//     pnpm exec tsx src/db/migrate-metrics-fields.ts'
async function main() {
  const db = await getDb();
  await db.query("DEFINE FIELD OVERWRITE scans ON metrics TYPE int DEFAULT 0");
  await db.query("DEFINE FIELD OVERWRITE failures ON metrics TYPE int DEFAULT 0");
  await db.query("DEFINE FIELD OVERWRITE p50 ON metrics TYPE option<int>");
  await db.query("DEFINE FIELD OVERWRITE p95 ON metrics TYPE option<int>");
  await db.query("DEFINE FIELD OVERWRITE p99 ON metrics TYPE option<int>");
  console.log("metrics latency/count fields applied");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
