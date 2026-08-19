// Shared session constants + types — safe to import from client/edge code
// (no Node-only dependencies here).
export const SESSION_COOKIE = "wcag_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string | null;
}
