import { describe, expect, it } from "vitest";
import { validateTargetUrl, type SsrfResolver } from "@/server/ssrf";

const publicResolver: SsrfResolver = {
  async resolveAddresses(hostname) {
    return hostname === "example.com" ? ["93.184.216.34"] : [];
  },
};

const privateResolver: SsrfResolver = {
  async resolveAddresses(hostname) {
    return hostname === "evil.internal" ? ["10.0.0.5"] : [];
  },
};

describe("SSRFGuard", () => {
  describe("invalid URLs (AC-E1)", () => {
    it.each([
      "",
      "not a url",
      "example.com",
      "http://",
      "ftp://example.com",
      "file:///etc/passwd",
      "javascript:alert(1)",
    ])("rejects %s with INVALID_URL", async (raw) => {
      const result = await validateTargetUrl(raw, publicResolver);
      expect(result).toEqual({ ok: false, code: "INVALID_URL" });
    });
  });

  describe("SSRF blocking (AC-E3)", () => {
    it.each([
      "http://localhost/",
      "http://sub.localhost/",
      "http://127.0.0.1/",
      "http://10.0.0.5/",
      "http://172.16.0.1/",
      "http://192.168.1.1/",
      "http://169.254.169.254/",
      "http://0.0.0.0/",
      "http://[::1]/",
      "http://[fd00::1]/",
      "http://[fe80::1]/",
      "http://[::ffff:127.0.0.1]/",
    ])("rejects %s with SSRF_BLOCKED", async (raw) => {
      const result = await validateTargetUrl(raw, publicResolver);
      expect(result).toEqual({ ok: false, code: "SSRF_BLOCKED" });
    });

    it("rejects a hostname that resolves to a private IP", async () => {
      const result = await validateTargetUrl("http://evil.internal/", privateResolver);
      expect(result).toEqual({ ok: false, code: "SSRF_BLOCKED" });
    });
  });

  describe("valid public targets", () => {
    it("accepts a public hostname", async () => {
      const result = await validateTargetUrl("https://example.com/path?q=1", publicResolver);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.url.hostname).toBe("example.com");
      }
    });

    it("accepts a public IPv4 literal", async () => {
      const result = await validateTargetUrl("http://93.184.216.34/", publicResolver);
      expect(result.ok).toBe(true);
    });

    it("accepts a public IPv6 literal", async () => {
      const result = await validateTargetUrl(
        "http://[2606:2800:220:1:248:1893:25c8:1946]/",
        publicResolver,
      );
      expect(result.ok).toBe(true);
    });
  });
});
