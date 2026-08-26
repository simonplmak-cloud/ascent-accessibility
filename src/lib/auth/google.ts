import { logger } from "@/lib/observability/logger";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

// Verifies a Google ID token via Google's tokeninfo endpoint and checks the
// audience. No OAuth library dependency.
export async function verifyGoogleToken(
  credential: string,
  fetchFn: typeof fetch = fetch,
): Promise<GoogleIdentity | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    logger.warn("google-verify: GOOGLE_CLIENT_ID is not set");
    return null;
  }
  try {
    const res = await fetchFn(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!res.ok) {
      logger.warn({ status: res.status }, "google-verify: tokeninfo request failed");
      return null;
    }
    const data = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
    };
    logger.info(
      {
        audMatch: data.aud === clientId,
        audPrefix: data.aud ? `${data.aud.slice(0, 12)}…` : undefined,
        clientPrefix: `${clientId.slice(0, 12)}…`,
      },
      "google-verify: tokeninfo response",
    );
    if (data.aud !== clientId) {
      logger.warn("google-verify: audience mismatch");
      return null;
    }
    if (!data.sub || !data.email) {
      logger.warn("google-verify: token missing sub or email");
      return null;
    }
    return {
      sub: data.sub,
      email: data.email,
      emailVerified: data.email_verified === true || data.email_verified === "true",
      name: typeof data.name === "string" ? data.name : undefined,
    };
  } catch (error) {
    logger.warn({ err: error }, "google-verify: verification threw");
    return null;
  }
}
