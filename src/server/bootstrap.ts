import { send } from "@vercel/queue";
import { createJobQueue, QUEUE_TOPIC, type JobQueue } from "@/lib/queue";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";
import { createApiKeyService } from "@/server/api-keys";
import { apiKeyRepository } from "@/db/repository";

export const rateLimiter = new SlidingWindowRateLimiter();

export const apiKeyService = createApiKeyService(apiKeyRepository);

let jobQueue: JobQueue | undefined;

export function getJobQueue(): JobQueue {
  if (!jobQueue) {
    jobQueue = createJobQueue(send, QUEUE_TOPIC);
  }
  return jobQueue;
}
