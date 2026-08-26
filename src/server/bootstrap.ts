import {
  SlidingWindowRateLimiter,
  SurrealDbRateLimiter,
  type RateLimiter,
} from "@/server/rate-limit";
import { createApiKeyService } from "@/server/api-keys";
import { apiKeyRepository } from "@/db/repository";

// Distributed (SurrealDB-backed) limiter in production so limits are shared
// across serverless instances. In-memory limiter is used for local dev / tests
// when SURREAL_URL is absent.
export const rateLimiter: RateLimiter = process.env.SURREAL_URL
  ? new SurrealDbRateLimiter()
  : new SlidingWindowRateLimiter();

export const apiKeyService = createApiKeyService(apiKeyRepository);
