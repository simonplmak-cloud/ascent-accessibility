import { afterEach, describe, expect, it } from "vitest";
import { providers, createOauthState, verifyOauthState } from "@/lib/auth/oauth";

describe("oauth state (signed, stateless)", () => {
  it("round-trips the next value", () => {
    const state = createOauthState("/site");
    expect(verifyOauthState(state)).toEqual({ next: "/site" });
  });

  it("rejects a tampered state", () => {
    const state = createOauthState("/site");
    const [payload] = state.split(".");
    const forged = `${payload}.${"a".repeat(43)}`;
    expect(verifyOauthState(forged)).toBeNull();
  });

  it("rejects a malformed state", () => {
    expect(verifyOauthState("not-a-valid-state")).toBeNull();
    expect(verifyOauthState("a.b.c")).toBeNull();
  });
});

function routeFetch(routes: Record<string, unknown>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : String(input);
    const body = routes[url];
    if (body !== undefined) {
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  }) as unknown as typeof fetch;
}

afterEach(() => {
  delete process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_SECRET;
  delete process.env.MICROSOFT_CLIENT_ID;
  delete process.env.MICROSOFT_CLIENT_SECRET;
});

describe("github provider", () => {
  it("builds the authorize URL with client id and redirect uri", () => {
    process.env.GITHUB_CLIENT_ID = "gh-client";
    const url = providers.github!.authorizeUrl("https://example.com/cb", "state123");
    expect(url).toContain("github.com/login/oauth/authorize");
    expect(url).toContain("client_id=gh-client");
    expect(url).toContain("state=state123");
    expect(url).toContain("scope=user%3Aemail");
  });

  it("exchanges a code for the primary verified email", async () => {
    process.env.GITHUB_CLIENT_ID = "gh-client";
    process.env.GITHUB_CLIENT_SECRET = "gh-secret";
    const fetchFn = routeFetch({
      "https://github.com/login/oauth/access_token": { access_token: "tok" },
      "https://api.github.com/user": { id: 42, login: "ada", name: "Ada Lovelace" },
      "https://api.github.com/user/emails": [
        { email: "secondary@example.com", primary: false, verified: true },
        { email: "ada@example.com", primary: true, verified: true },
      ],
    });
    const identity = await providers.github!.exchange("code", "https://example.com/cb", fetchFn);
    expect(identity).toMatchObject({
      provider: "github",
      subject: "42",
      email: "ada@example.com",
      name: "Ada Lovelace",
      verified: true,
    });
  });
});

describe("microsoft provider", () => {
  it("exchanges a code for the user identity via Microsoft Graph", async () => {
    process.env.MICROSOFT_CLIENT_ID = "ms-client";
    process.env.MICROSOFT_CLIENT_SECRET = "ms-secret";
    const fetchFn = routeFetch({
      "https://login.microsoftonline.com/common/oauth2/v2.0/token": { access_token: "tok" },
      "https://graph.microsoft.com/v1.0/me": {
        id: "abc-123",
        displayName: "Ada Lovelace",
        mail: "ada@example.com",
        userPrincipalName: "ada@example.com",
      },
    });
    const identity = await providers.microsoft!.exchange("code", "https://example.com/cb", fetchFn);
    expect(identity).toMatchObject({
      provider: "microsoft",
      subject: "abc-123",
      email: "ada@example.com",
      name: "Ada Lovelace",
      verified: true,
    });
  });

  it("falls back to userPrincipalName when mail is missing", async () => {
    process.env.MICROSOFT_CLIENT_ID = "ms-client";
    process.env.MICROSOFT_CLIENT_SECRET = "ms-secret";
    const fetchFn = routeFetch({
      "https://login.microsoftonline.com/common/oauth2/v2.0/token": { access_token: "tok" },
      "https://graph.microsoft.com/v1.0/me": {
        id: "abc-123",
        displayName: "Ada",
        mail: null,
        userPrincipalName: "ada@org.onmicrosoft.com",
      },
    });
    const identity = await providers.microsoft!.exchange("code", "https://example.com/cb", fetchFn);
    expect(identity?.email).toBe("ada@org.onmicrosoft.com");
  });
});
