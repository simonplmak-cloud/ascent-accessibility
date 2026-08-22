import { NextResponse } from "next/server";
import { curriculumFor } from "@/lib/training/curriculum";
import { gradeCheck } from "@/lib/training/quiz";

// Grade a single per-lesson practice check (formative). Answer keys never reach
// the client — the question is served without its answerIndex and graded here.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") ?? undefined;
  const meta = curriculumFor(locale).lessonMeta[id];
  if (!meta?.check) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { answerIndex?: unknown };
  const answerIndex = Number(body.answerIndex);
  if (!Number.isInteger(answerIndex)) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  return NextResponse.json(gradeCheck(meta.check, answerIndex));
}
