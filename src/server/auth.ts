import { cookies } from "next/headers";
import { createConnection } from "@/db";
import { ANON_COOKIE, SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/auth/session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await createConnection();
  try {
    return await verifySessionToken(db, token);
  } catch {
    return null;
  } finally {
    await db.close();
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.email ?? null;
}

// Owner of an assessment: the signed-in user's email, or the anonymous session id
// (a browser cookie) so anonymous visitors still see only their own history.
export async function getOwnerId(): Promise<string | null> {
  const user = await getSessionUser();
  if (user) return user.email;
  const store = await cookies();
  return store.get(ANON_COOKIE)?.value ?? null;
}
