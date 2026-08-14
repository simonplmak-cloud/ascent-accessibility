export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }>;
}

export const IP_RATE_LIMIT = 10;
export const RATE_WINDOW_MS = 60_000;

export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly buckets: Map<string, number[]>;
  private readonly now: () => number;

  constructor(buckets = new Map<string, number[]>(), now: () => number = Date.now) {
    this.buckets = buckets;
    this.now = now;
  }

  async check(key: string, limit: number, windowMs: number) {
    const now = this.now();
    const cutoff = now - windowMs;
    const bucket = (this.buckets.get(key) ?? []).filter((ts) => ts > cutoff);

    if (bucket.length >= limit) {
      this.buckets.set(key, bucket);
      return { allowed: false, remaining: 0 };
    }

    bucket.push(now);
    this.buckets.set(key, bucket);
    return { allowed: true, remaining: limit - bucket.length };
  }
}
