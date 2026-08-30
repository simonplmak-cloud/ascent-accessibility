import { describe, expect, it } from "vitest";
import { describeScanFailure } from "@/lib/assessment";
import { ScanFailedError } from "@/lib/scanner";

describe("describeScanFailure", () => {
  it("classifies an HTTP 403 as bot/WAF protection", () => {
    expect(describeScanFailure(new ScanFailedError("Could not load https://x/: HTTP 403"))).toBe(
      "blocked (HTTP 403 — bot/WAF protection)",
    );
  });

  it("classifies an HTTP 429 as rate limited", () => {
    expect(describeScanFailure(new ScanFailedError("Could not load https://x/: HTTP 429"))).toBe(
      "rate limited (HTTP 429)",
    );
  });

  it("classifies a 404 as not found", () => {
    expect(describeScanFailure(new ScanFailedError("Could not load https://x/: HTTP 404"))).toBe(
      "not found (HTTP 404)",
    );
  });

  it("classifies a 5xx as server error", () => {
    expect(describeScanFailure(new ScanFailedError("Could not load https://x/: HTTP 503"))).toBe(
      "server error (HTTP 503)",
    );
  });

  it("extracts a net::ERR_ code from a navigation failure", () => {
    expect(
      describeScanFailure(
        new ScanFailedError("Could not load https://x/: net::ERR_NAME_NOT_RESOLVED at https://x/"),
      ),
    ).toBe("network error (ERR_NAME_NOT_RESOLVED)");
  });

  it("falls through to the raw message for unknown errors", () => {
    expect(describeScanFailure(new Error("boom"))).toBe("boom");
  });
});
