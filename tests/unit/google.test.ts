import { beforeAll, describe, expect, it } from "vitest";
import { verifyGoogleToken } from "@/lib/auth/google";

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = "client-123";
});

function jsonResponse(body: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
}

describe("verifyGoogleToken", () => {
  it("verifies a token with a matching audience and confirmed email", async () => {
    const identity = await verifyGoogleToken(
      "t",
      jsonResponse({
        aud: "client-123",
        sub: "s1",
        email: "a@b.example",
        email_verified: "true",
        name: "Ada",
      }),
    );
    expect(identity?.sub).toBe("s1");
    expect(identity?.email).toBe("a@b.example");
    expect(identity?.emailVerified).toBe(true);
  });

  it("rejects a token with a wrong audience", async () => {
    const identity = await verifyGoogleToken(
      "t",
      jsonResponse({ aud: "other", sub: "s1", email: "a@b.example" }),
    );
    expect(identity).toBeNull();
  });

  it("rejects a token missing sub or email", async () => {
    const identity = await verifyGoogleToken(
      "t",
      jsonResponse({ aud: "client-123", sub: "s1" }),
    );
    expect(identity).toBeNull();
  });

  it("rejects on a network error", async () => {
    const failing = (async () => {
      throw new Error("boom");
    }) as unknown as typeof fetch;
    expect(await verifyGoogleToken("t", failing)).toBeNull();
  });
});
