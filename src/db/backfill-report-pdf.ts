import { getDb } from "./index";
import { renderAndStoreReportPdf } from "@/lib/export/render-report-pdf";

// One-shot backfill: re-render + store the PDF for every completed assessment
// missing a report_pdf record (e.g. after the worker's PDF render was broken).
// Idempotent — renderAndStoreReportPdf upserts, so re-runs skip stored reports.
async function main() {
  const db = await getDb();

  const completedResult = (await db
    .query("SELECT type::string(id) AS id FROM assessment WHERE status = 'completed'")
    .json()
    .collect()) as unknown[];
  const completed = (completedResult[0] as { id: string }[] | undefined) ?? [];

  const storedResult = (await db
    .query("SELECT VALUE assessmentId FROM report_pdf")
    .json()
    .collect()) as unknown[];
  const storedValues = (storedResult[0] as string[] | undefined) ?? [];
  const stored = new Set(storedValues);

  const missing = completed.map((r) => r.id).filter((id) => !stored.has(id));

  console.log(
    `completed: ${completed.length}, stored: ${stored.size}, missing: ${missing.length}`,
  );

  let done = 0;
  for (const id of missing) {
    try {
      await renderAndStoreReportPdf(id);
      done += 1;
      console.log(`backfilled ${done}/${missing.length}: ${id}`);
    } catch (error) {
      console.error(`failed ${id}:`, error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`backfill complete: ${done}/${missing.length} stored`);
  await db.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
