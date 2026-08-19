import { afterEach, describe, expect, it } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { providers } from "@/lib/auth/oauth";

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

describe("wechat provider", () => {
  it("exchanges a code for openid + a synthetic email", async () => {
    process.env.WECHAT_APP_ID = "wx-app";
    process.env.WECHAT_APP_SECRET = "wx-secret";
    const fetchFn = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/sns/oauth2/access_token")) {
        return new Response(
          JSON.stringify({ access_token: "tok", openid: "openid-1", unionid: "union-1" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("/sns/userinfo")) {
        return new Response(JSON.stringify({ openid: "openid-1", nickname: "小明", unionid: "union-1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    }) as unknown as typeof fetch;

    const identity = await providers.wechat!.exchange("code", "https://example.com/cb", fetchFn);
    expect(identity).toMatchObject({
      provider: "wechat",
      subject: "union-1",
      email: "wechat-union-1@oauth.local",
      name: "小明",
      verified: true,
    });
  });
});

describe("alipay provider", () => {
  it("signs requests and exchanges a code for user_id + synthetic email", async () => {
    process.env.ALIPAY_APP_ID = "2021000000000000";
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    process.env.ALIPAY_PRIVATE_KEY = privateKey.export({ type: "pkcs1", format: "pem" }).toString();

    const fetchFn = (async (_input: string | URL | Request, init?: RequestInit) => {
      const body = init?.body ? String(init.body) : "";
      if (body.includes("alipay.user.info.share")) {
        return new Response(
          JSON.stringify({ alipay_user_info_share_response: { user_id: "2088abc", nick_name: "小明" } }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ alipay_system_oauth_token_response: { access_token: "tok", user_id: "2088abc" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const identity = await providers.alipay!.exchange("auth_code", "https://example.com/cb", fetchFn);
    expect(identity).toMatchObject({
      provider: "alipay",
      subject: "2088abc",
      email: "alipay-2088abc@oauth.local",
      name: "小明",
      verified: true,
    });
  });
});
