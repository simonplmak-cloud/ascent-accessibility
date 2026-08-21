import { NextResponse } from "next/server";
import { z } from "zod";
import { trainingRepository } from "@/db/repository";
import { getUserId } from "@/server/auth";

const statusSchema = z.enum(["not_started", "in_progress", "completed", "needs_retry"]);

const upsertSchema = z.object({
  path: z.string().min(1).max(200),
  activity: z.string().min(1).max(200),
  status: statusSchema,
  score: z.number().int().min(0).max(100).nullable().optional(),
  lastPosition: z.string().max(1024).nullable().optional(),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const progress = await trainingRepository.listProgress(userId);
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  await trainingRepository.upsertProgress(userId, {
    path: parsed.data.path,
    activity: parsed.data.activity,
    status: parsed.data.status,
    score: parsed.data.score ?? null,
    lastPosition: parsed.data.lastPosition ?? null,
  });
  return NextResponse.json({ ok: true });
}
