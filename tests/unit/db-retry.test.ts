import { describe, expect, it, vi } from "vitest";
import { withDbRetry } from "@/db";

const CONFLICT = new Error(
  "There was a problem with the key-value store: Transaction conflict: Resource busy. This transaction can be retried",
);

describe("withDbRetry", () => {
  it("retries a transient write conflict and returns the result (AC-3)", async () => {
    const op = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(CONFLICT)
      .mockRejectedValueOnce(CONFLICT)
      .mockResolvedValueOnce("ok");

    const result = await withDbRetry(op);

    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("re-throws the conflict after retries are exhausted (AC-3)", async () => {
    const op = vi.fn<() => Promise<string>>().mockRejectedValue(CONFLICT);

    await expect(withDbRetry(op)).rejects.toThrow(/Transaction conflict/);
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("re-throws a non-retryable error immediately (AC-E1)", async () => {
    const op = vi.fn<() => Promise<string>>().mockRejectedValue(new Error("boom"));

    await expect(withDbRetry(op)).rejects.toThrow("boom");
    expect(op).toHaveBeenCalledTimes(1);
  });
});
