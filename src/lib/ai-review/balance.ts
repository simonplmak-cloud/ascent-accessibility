// Pure balance ↔ limit mapping for Provisioned AI. OpenRouter's key `limit`/
// `usage` are USD amounts (double), so the mapping is a cent→dollar conversion.
export const DEFAULT_TOPUP_TIERS_USD = [5, 10, 20] as const;

export function balanceToLimitUsd(cents: number): number {
  return Math.round(cents) / 100;
}

export function topupTiersUsd(
  env: string | undefined = process.env.STRIPE_AI_TOPUP_TIERS,
): number[] {
  const tiers = (env ?? "")
    .split(",")
    .map((t) => Number(t.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return tiers.length > 0 ? tiers : [...DEFAULT_TOPUP_TIERS_USD];
}
