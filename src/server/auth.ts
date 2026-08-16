import { cookies } from "next/headers";
import { createConnection } from "@/db";
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/auth/session";

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
  return user?.id ?? null;
}
