import { query } from "@/db";
import { updateOpenRouterKey } from "@/server/openrouter-admin";
import { balanceToLimitUsd } from "@/lib/ai-review/balance";

// Re-sync a user's provisioned OpenRouter key limit to their funded balance.
// No-op for accounts without a provisioned key.
export async function syncProvisionedLimit(userId: string): Promise<void> {
  const rows = await query<{
    aiBalanceCents: number | null;
    openrouterKeyHash: string | null;
    aiKeyKind: string | null;
  }>(
    "SELECT aiBalanceCents, openrouterKeyHash, aiKeyKind FROM user WHERE id = type::record($id) LIMIT 1",
    { id: userId },
  );
  const row = rows[0];
  if (!row?.openrouterKeyHash || row.aiKeyKind !== "provisioned") return;
  const balanceCents = row.aiBalanceCents ?? 0;
  await updateOpenRouterKey(row.openrouterKeyHash, {
    limitUsd: balanceToLimitUsd(Math.max(0, balanceCents)),
  });
}
