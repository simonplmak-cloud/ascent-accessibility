export interface Entitlement {
  userId: string | null;
  subscribed: boolean;
}

export type GateResult =
  | { ok: true }
  | { ok: false; code: "UNAUTHORIZED" | "PAYMENT_REQUIRED" };

export function isWholeSiteAllowed(entitlement: Entitlement): GateResult {
  if (!entitlement.userId) return { ok: false, code: "UNAUTHORIZED" };
  if (!entitlement.subscribed) return { ok: false, code: "PAYMENT_REQUIRED" };
  return { ok: true };
}
