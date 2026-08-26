import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";

describe("SlidingWindowRateLimiter", () => {
  it("allows requests up to the limit (AC-E4)", async () => {
    const now = 0;
    const limiter = new SlidingWindowRateLimiter(new Map(), () => now);
    for (let i = 0; i < 10; i++) {
      const result = await limiter.check("ip-1", 10, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over the limit", async () => {
    const now = 0;
    const limiter = new SlidingWindowRateLimiter(new Map(), () => now);
    for (let i = 0; i < 10; i++) await limiter.check("ip-1", 10, 60_000);
    const result = await limiter.check("ip-1", 10, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window elapses", async () => {
    let now = 0;
    const limiter = new SlidingWindowRateLimiter(new Map(), () => now);
    for (let i = 0; i < 10; i++) await limiter.check("ip-1", 10, 60_000);
    now = 60_001;
    const result = await limiter.check("ip-1", 10, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("tracks distinct keys independently", async () => {
    const now = 0;
    const limiter = new SlidingWindowRateLimiter(new Map(), () => now);
    for (let i = 0; i < 10; i++) await limiter.check("ip-1", 10, 60_000);
    const result = await limiter.check("ip-2", 10, 60_000);
    expect(result.allowed).toBe(true);
  });
});
