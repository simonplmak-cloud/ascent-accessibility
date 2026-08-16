import { query } from "@/db";

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

// Fixed-window counter stored in SurrealDB so limits are shared across all
// serverless instances (the in-memory limiter above is per-instance only).
// Fails open (allows) on any DB error so a SurrealDB outage never blocks scans.
export class SurrealDbRateLimiter implements RateLimiter {
  async check(key: string, limit: number, windowMs: number) {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    try {
      const updated = await query<{ count: number }>(
        "UPDATE rate_limit SET count = count + 1 WHERE key = $key AND windowStart = $windowStart RETURN AFTER",
        { key, windowStart },
      );
      if (updated.length === 0) {
        try {
          await query(
            "CREATE rate_limit SET key = $key, windowStart = $windowStart, count = 1",
            { key, windowStart },
          );
        } catch {
          // Lost a create race against another instance — increment instead.
          await query(
            "UPDATE rate_limit SET count = count + 1 WHERE key = $key AND windowStart = $windowStart",
            { key, windowStart },
          );
        }
      }
      const rows = await query<{ count: number }>(
        "SELECT count FROM rate_limit WHERE key = $key AND windowStart = $windowStart LIMIT 1",
        { key, windowStart },
      );
      const count = rows[0]?.count ?? 0;

      // Opportunistically prune expired windows (~1% of checks).
      if (Math.random() < 0.01) {
        try {
          await query("DELETE rate_limit WHERE windowStart < $cutoff", {
            cutoff: Date.now() - 3_600_000,
          });
        } catch {
          /* ignore cleanup failures */
        }
      }

      return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      return { allowed: true, remaining: limit };
    }
  }
}
