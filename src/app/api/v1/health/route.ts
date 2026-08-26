import { NextResponse } from "next/server";
import { metricsRepository } from "@/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = await metricsRepository.read();
  return NextResponse.json({
    storageBytes: metrics?.storageBytes ?? 0,
    queueDepth: metrics?.queueDepth ?? 0,
    failedScans24h: metrics?.failedScans24h ?? 0,
    updatedAt: metrics?.updatedAt ?? null,
  });
}
