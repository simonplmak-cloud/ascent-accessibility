import { SlidingWindowRateLimiter } from "@/server/rate-limit";
import { createApiKeyService } from "@/server/api-keys";
import { apiKeyRepository } from "@/db/repository";

export const rateLimiter = new SlidingWindowRateLimiter();

export const apiKeyService = createApiKeyService(apiKeyRepository);
