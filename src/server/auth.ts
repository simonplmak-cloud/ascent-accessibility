import { cookies } from "next/headers";
import { query } from "@/db";
import { SESSION_COOKIE, verifySession, type SessionUser } from "@/lib/auth/session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const verified = verifySession(token);
  if (!verified) return null;

  try {
    const users = await query<{ id: string; name: string; role: string | null }>(
      "SELECT id, name, role FROM user WHERE id = type::record($id) LIMIT 1",
      { id: verified.userId },
    );
    const account = users[0];
    if (!account?.id) return null;

    const emails = await query<{ email: string }>(
      "SELECT email FROM user_email WHERE user = type::record($id) AND primary = true LIMIT 1",
      { id: verified.userId },
    );

    return {
      id: account.id,
      name: String(account.name ?? ""),
      role: account.role ?? null,
      email: emails[0]?.email ?? "",
    };
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}

export async function getRole(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.role ?? null;
}

export async function isReviewer(): Promise<boolean> {
  return (await getRole()) === "reviewer";
}

// Owner of an assessment: the signed-in account id. No anonymous scanning.
export async function getOwnerId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}
