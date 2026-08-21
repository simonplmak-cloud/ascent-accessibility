import { NextResponse } from "next/server";
import { z } from "zod";
import { trainingRepository } from "@/db/repository";
import { getSessionUser } from "@/server/auth";

const issueSchema = z.object({
  path: z.string().min(1).max(200),
  pathVersion: z.string().min(1).max(50),
  score: z.number().int().min(0).max(100).nullable().optional(),
  completedAt: z.string(),
});

export async function GET() {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const credentials = await trainingRepository.listCredentials(userId.id);
  return NextResponse.json({ credentials });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const credential = await trainingRepository.issueCredential(user.id, {
    name: user.name || user.email,
    path: parsed.data.path,
    pathVersion: parsed.data.pathVersion,
    score: parsed.data.score ?? null,
    completedAt: parsed.data.completedAt,
  });
  return NextResponse.json({ credential });
}
