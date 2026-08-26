import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { STORAGE_QUOTA_BYTES_PER_USER, usedBytesByOwner } from "@/lib/storage-quota";

const ASSESSMENT_RETENTION_DAYS = Number(process.env.ASSESSMENT_RETENTION_DAYS ?? 180);

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const usedBytes = await usedBytesByOwner(sessionUser.id);
  return NextResponse.json({
    usedBytes,
    quotaBytes: STORAGE_QUOTA_BYTES_PER_USER,
    retentionDays: ASSESSMENT_RETENTION_DAYS,
  });
}
