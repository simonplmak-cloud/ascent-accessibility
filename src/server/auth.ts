import { auth as clerkAuth } from "@clerk/nextjs/server";

// Returns the authenticated Clerk user id, or null when Clerk is not configured
// (no CLERK_SECRET_KEY) or no session is present. Fails open to null so the app
// still runs without Clerk keys — whole-site scans then fail closed (401).
export async function getUserId(): Promise<string | null> {
  if (!process.env.CLERK_SECRET_KEY) return null;
  try {
    const { userId } = await clerkAuth();
    return userId ?? null;
  } catch {
    return null;
  }
}
