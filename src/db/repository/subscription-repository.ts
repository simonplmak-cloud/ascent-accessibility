import { query } from "../index";
import type { Subscription, SubscriptionStatus } from "../schema";

type RawRecord = Record<string, unknown>;

function mapSubscription(raw: RawRecord): Subscription {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    status: raw.status as SubscriptionStatus,
    stripeCustomerId: raw.stripeCustomerId ? String(raw.stripeCustomerId) : null,
    stripeSubscriptionId: raw.stripeSubscriptionId
      ? String(raw.stripeSubscriptionId)
      : null,
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export interface SubscriptionUpsert {
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export const subscriptionRepository = {
  async getByUserId(userId: string): Promise<Subscription | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM subscription WHERE userId = $userId LIMIT 1",
      { userId },
    );
    return rows[0] ? mapSubscription(rows[0]) : undefined;
  },

  async getByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM subscription WHERE stripeSubscriptionId = $stripeSubscriptionId LIMIT 1",
      { stripeSubscriptionId },
    );
    return rows[0] ? mapSubscription(rows[0]) : undefined;
  },

  async upsert(userId: string, input: SubscriptionUpsert): Promise<Subscription> {
    const existing = await this.getByUserId(userId);

    if (existing) {
      const sets = ["status = $status", "updatedAt = time::now()"];
      const bindings: Record<string, unknown> = { userId, status: input.status };
      if (input.stripeCustomerId !== undefined) {
        sets.push("stripeCustomerId = $stripeCustomerId");
        bindings.stripeCustomerId = input.stripeCustomerId;
      }
      if (input.stripeSubscriptionId !== undefined) {
        sets.push("stripeSubscriptionId = $stripeSubscriptionId");
        bindings.stripeSubscriptionId = input.stripeSubscriptionId;
      }
      const rows = await query<RawRecord>(
        `UPDATE subscription SET ${sets.join(", ")} WHERE userId = $userId RETURN AFTER`,
        bindings,
      );
      return mapSubscription(rows[0]!);
    }

    const rows = await query<RawRecord>("CREATE subscription CONTENT $data", {
      data: {
        userId,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId ?? null,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      },
    });
    return mapSubscription(rows[0]!);
  },
};
