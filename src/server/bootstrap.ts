import { Client } from "@upstash/qstash";
import { createJobQueue, type JobQueue } from "@/lib/queue";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";
import { createApiKeyService } from "@/server/api-keys";
import { apiKeyRepository } from "@/db/repository";

export const rateLimiter = new SlidingWindowRateLimiter();

export const apiKeyService = createApiKeyService(apiKeyRepository);

function workerUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000";
  const origin = base.startsWith("http") ? base : `https://${base}`;
  return `${origin}/api/jobs/run`;
}

let jobQueue: JobQueue | undefined;

export function getJobQueue(): JobQueue {
  if (!jobQueue) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) throw new Error("QSTASH_TOKEN is not set");
    jobQueue = createJobQueue(new Client({ token }), workerUrl());
  }
  return jobQueue;
}
