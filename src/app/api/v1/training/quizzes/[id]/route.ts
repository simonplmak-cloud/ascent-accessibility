import { NextResponse } from "next/server";
import { curriculumFor } from "@/lib/training/curriculum";
import { gradeQuiz } from "@/lib/training/quiz";

function localeOf(req: Request): string | undefined {
  const url = new URL(req.url);
  return url.searchParams.get("locale") ?? undefined;
}

// GET returns the quiz without answer keys (grading is server-side).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quiz = curriculumFor(localeOf(req)).quizzes[id];
  if (!quiz) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    passThreshold: quiz.passThreshold,
    questions: quiz.questions.map(({ id: qid, prompt, options }) => ({ id: qid, prompt, options })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const quiz = curriculumFor(localeOf(req)).quizzes[id];
  if (!quiz) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { answers?: Record<string, number> };
  const answers = body.answers ?? {};
  return NextResponse.json(gradeQuiz(quiz, answers));
}
