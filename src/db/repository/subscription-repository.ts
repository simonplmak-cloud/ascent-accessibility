import { query } from "../index";
import type { Subscription } from "../schema";

type RawRecord = Record<string, unknown>;

function mapSubscription(raw: RawRecord): Subscription {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    status: raw.status as Subscription["status"],
    stripeCustomerId: raw.stripeCustomerId ? String(raw.stripeCustomerId) : null,
    stripeSubscriptionId: raw.stripeSubscriptionId ? String(raw.stripeSubscriptionId) : null,
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export const subscriptionRepository = {
  async findByUser(userId: string): Promise<Subscription | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM subscription WHERE userId = $userId LIMIT 1",
      { userId },
    );
    return rows[0] ? mapSubscription(rows[0]) : undefined;
  },

  async isActive(userId: string): Promise<boolean> {
    const sub = await this.findByUser(userId);
    return sub?.status === "active";
  },

  async activate(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
  ): Promise<void> {
    // Upsert by userId (the unique key) — update the existing row rather than
    // creating a duplicate. The `subscription_user_idx` unique index backs this.
    const existing = await this.findByUser(userId);
    if (existing) {
      await query(
        "UPDATE type::record($id) SET status = 'active', stripeCustomerId = $stripeCustomerId, stripeSubscriptionId = $stripeSubscriptionId, updatedAt = time::now()",
        { id: existing.id, stripeCustomerId, stripeSubscriptionId },
      );
    } else {
      await query(
        "CREATE subscription SET userId = $userId, status = 'active', stripeCustomerId = $stripeCustomerId, stripeSubscriptionId = $stripeSubscriptionId, updatedAt = time::now()",
        { userId, stripeCustomerId, stripeSubscriptionId },
      );
    }
  },

  async deactivateByStripeSub(stripeSubscriptionId: string): Promise<void> {
    await query(
      "UPDATE subscription SET status = 'inactive', updatedAt = time::now() WHERE stripeSubscriptionId = $stripeSubscriptionId",
      { stripeSubscriptionId },
    );
  },
};
