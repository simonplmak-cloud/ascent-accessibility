import { assessmentRepository } from "@/db/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Streams an assessment's progress as newline-delimited JSON events:
//   {"type":"status","status":"..."}
//   {"type":"log","entry":{...}}
//   {"type":"done","score":...,"findings":[...],...}
// Polls SurrealDB every ~200ms so the client sees log updates near-instantly.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let lastLogCount = 0;
      let lastStatus = "";

      const send = async () => {
        if (closed) return;
        try {
          const assessment = await assessmentRepository.findById(id);
          if (!assessment) {
            controller.enqueue(encoder.encode(`${JSON.stringify({ type: "notfound" })}\n`));
            controller.close();
            return;
          }

          if (assessment.status !== lastStatus) {
            lastStatus = assessment.status;
            controller.enqueue(
              encoder.encode(`${JSON.stringify({ type: "status", status: assessment.status })}\n`),
            );
          }

          const log = await assessmentRepository.readLog(id);
          if (log.length > lastLogCount) {
            const fresh = log.slice(lastLogCount);
            lastLogCount = log.length;
            for (const entry of fresh) {
              controller.enqueue(
                encoder.encode(`${JSON.stringify({ type: "log", entry })}\n`),
              );
            }
          }

          if (assessment.status === "completed" || assessment.status === "failed") {
            const findings =
              assessment.status === "completed"
                ? await assessmentRepository.findFindings(id)
                : [];
            const comparison = await assessmentRepository.findComparison(id);
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  type: "done",
                  id: assessment.id,
                  status: assessment.status,
                  partial: assessment.partial,
                  url: assessment.url,
                  standard: assessment.standard,
                  score: assessment.score,
                  passBand: assessment.passBand,
                  pagesScanned: assessment.pagesScanned,
                  log,
                  findings,
                  comparison: comparison ?? undefined,
                })}\n`,
              ),
            );
            controller.close();
            closed = true;
            return;
          }
        } catch {
          /* transient read error — keep polling */
        }
      };

      await send();
      timer = setInterval(() => void send(), 200);
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
