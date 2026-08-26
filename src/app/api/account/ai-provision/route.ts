import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { query } from "@/db";
import { encryptKey, maskKey } from "@/server/byok";
import { createOpenRouterKey, updateOpenRouterKey } from "@/server/openrouter-admin";
import { balanceToLimitUsd } from "@/lib/ai-review/balance";

// Provision (or re-provision) a spend-capped OpenRouter key for the signed-in
// account, capped to its Stripe-funded balance. The key string is encrypted at
// rest immediately and never returned to the client (masked only).
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const rows = await query<{
    aiBalanceCents: number | null;
    openrouterKeyHash: string | null;
    aiKeyKind: string | null;
  }>(
    "SELECT aiBalanceCents, openrouterKeyHash, aiKeyKind FROM user WHERE id = type::record($id) LIMIT 1",
    { id: user.id },
  );
  const row = rows[0];
  const balanceCents = row?.aiBalanceCents ?? 0;
  if (balanceCents <= 0) {
    return NextResponse.json(
      { code: "AI_NO_BALANCE", message: "Add credits before enabling AI review." },
      { status: 402 },
    );
  }
  const limitUsd = balanceToLimitUsd(balanceCents);

  try {
    const existingHash = row?.openrouterKeyHash ?? null;
    if (existingHash) {
      // Re-provision: sync the existing key's limit to the current balance.
      await updateOpenRouterKey(existingHash, { limitUsd });
      return NextResponse.json({
        code: "SYNCED",
        masked: null,
        provider: "OpenRouter",
        keyKind: "provisioned",
      });
    }
    const created = await createOpenRouterKey({
      name: `ascent-${user.id.replace(":", "-")}`,
      limitUsd,
    });
    const encrypted = encryptKey(created.key);
    await query(
      "UPDATE user SET aiApiKey = $enc, aiProvider = $provider, aiKeyKind = $kind, openrouterKeyHash = $hash WHERE id = type::record($id)",
      {
        id: user.id,
        enc: JSON.stringify(encrypted),
        provider: "openrouter",
        kind: "provisioned",
        hash: created.hash,
      },
    );
    return NextResponse.json({
      code: "PROVISIONED",
      masked: maskKey(created.key),
      provider: "OpenRouter",
      keyKind: "provisioned",
    });
  } catch {
    return NextResponse.json(
      { code: "PROVISION_UNAVAILABLE", message: "Provisioning is temporarily unavailable." },
      { status: 502 },
    );
  }
}
