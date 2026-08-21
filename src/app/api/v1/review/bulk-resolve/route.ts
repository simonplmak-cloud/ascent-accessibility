import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, isReviewer } from "@/server/auth";
import { assessmentIdSchema } from "@/server/validation";
import { resolveAssessmentReview } from "@/server/review";

const itemSchema = z.object({
  id: z.string().min(1),
  resolutions: z.record(z.object({ verdict: z.string().optional(), note: z.string().optional() })).optional(),
});

export async function POST(req: Request) {
  if (!(await isReviewer())) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const user = await getSessionUser();
  const body = (await req.json().catch(() => ({}))) as { items?: unknown };

  const parsed = z.array(itemSchema).max(100).safeParse(body.items);
  if (!parsed.success || (parsed.data ?? []).length === 0) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const reviewedBy = user?.email ?? "";
  const results: Array<Record<string, unknown>> = [];

  for (const item of parsed.data) {
    if (!assessmentIdSchema.safeParse(item.id).success) {
      results.push({ id: item.id, ok: false, code: "NOT_FOUND" });
      continue;
    }
    const result = await resolveAssessmentReview(item.id, item.resolutions ?? {}, reviewedBy);
    if (result.ok) {
      results.push({ id: item.id, ok: true, claim: result.claim });
    } else {
      results.push({
        id: item.id,
        ok: false,
        code: result.code,
        ...(result.unresolved ? { unresolved: result.unresolved } : {}),
      });
    }
  }

  return NextResponse.json({ results });
}
