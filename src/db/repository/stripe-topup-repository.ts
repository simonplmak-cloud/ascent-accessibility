import { query } from "../index";

// Idempotent Stripe top-up credit. `sessionId` carries a UNIQUE index, so a
// replayed `checkout.session.completed` event fails the CREATE and we return
// false without double-crediting the balance.
export const stripeTopupRepository = {
  async credit(userId: string, amountCents: number, sessionId: string): Promise<boolean> {
    try {
      await query("CREATE stripe_topup CONTENT $data", {
        data: { sessionId, userId, amountCents },
      });
    } catch {
      return false; // duplicate sessionId — already credited
    }
    await query(
      "UPDATE user SET aiBalanceCents = (aiBalanceCents ?? 0) + $amt WHERE id = type::record($id)",
      { id: userId, amt: amountCents },
    );
    return true;
  },
};
