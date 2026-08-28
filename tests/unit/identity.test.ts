import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ query: vi.fn() }));

import { query } from "@/db";
import { EmailConflictError, linkOrCreateOAuth } from "@/lib/auth/identity";

const queryMock = vi.mocked(query);

beforeEach(() => {
  queryMock.mockReset();
});

const identity = {
  provider: "google",
  subject: "sub-1",
  email: "Simon@Example.COM",
  name: "Simon",
  verified: true,
};

describe("linkOrCreateOAuth", () => {
  it("returns the existing linked user (by provider + subject)", async () => {
    queryMock.mockResolvedValueOnce([{ user: "user:1" }]);
    const userId = await linkOrCreateOAuth(identity);
    expect(userId).toBe("user:1");
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("links a verified identity to an existing verified email", async () => {
    queryMock
      .mockResolvedValueOnce([]) // oauth link lookup
      .mockResolvedValueOnce([{ user: "user:2", verified: true }]); // email lookup
    const userId = await linkOrCreateOAuth(identity);
    expect(userId).toBe("user:2");
  });

  it("creates a user + email + link when the email is absent", async () => {
    queryMock
      .mockResolvedValueOnce([]) // oauth link lookup
      .mockResolvedValueOnce([]) // email lookup (absent)
      .mockResolvedValueOnce([{ id: "user:3" }]); // CREATE user
    const userId = await linkOrCreateOAuth(identity);
    expect(userId).toBe("user:3");
  });

  it("normalizes the email (trim + lowercase) before the lookup", async () => {
    const calls: Array<{ statement: string; bindings?: Record<string, unknown> }> = [];
    queryMock.mockImplementation(async (statement: string, bindings?: Record<string, unknown>) => {
      calls.push({ statement, bindings });
      if (statement.includes("user_oauth_link WHERE")) return [];
      if (statement.includes("user_email WHERE email")) return [{ user: "user:2", verified: true }];
      return [];
    });
    await linkOrCreateOAuth({ ...identity, email: "  Simon@Example.COM  " });
    const emailLookup = calls.find((c) => c.statement.includes("user_email WHERE email"));
    expect(emailLookup?.bindings?.email).toBe("simon@example.com");
  });

  it("throws EmailConflictError for an unverified identity claiming an existing email", async () => {
    queryMock
      .mockResolvedValueOnce([]) // oauth link lookup
      .mockResolvedValueOnce([{ user: "user:4", verified: false }]); // existing unverified email
    await expect(linkOrCreateOAuth({ ...identity, verified: false })).rejects.toBeInstanceOf(
      EmailConflictError,
    );
  });
});
