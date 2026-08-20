import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/db/schema";

// Stripe subscription status → our two-state entitlement. `trialing` counts as
// active; anything else (canceled, incomplete, unpaid, past_due, …) is inactive.
export function mapSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  return stripeStatus === "active" || stripeStatus === "trialing"
    ? "active"
    : "inactive";
}

// Minimal store surface the webhook needs — injected so the handler is unit-
// testable without a database.
export interface SubscriptionStore {
  upsert(
    userId: string,
    input: {
      status: SubscriptionStatus;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
    },
  ): Promise<unknown>;
}

// Resolves the account id a Stripe event belongs to. The site-subscription
// checkout sets both `client_reference_id` (on the session) and
// `metadata.userId` (on the resulting subscription).
export function userIdFromSession(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? null;
}

export function userIdFromSubscription(sub: Stripe.Subscription): string | null {
  return sub.metadata?.userId ?? null;
}

// Routes a Stripe webhook event to the subscription store. Events without a
// resolvable account id (e.g. one-time donation sessions) are no-ops.
export async function handleWebhookEvent(
  event: Stripe.Event,
  store: SubscriptionStore,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = userIdFromSession(session);
      if (!userId) return;
      await store.upsert(userId, {
        status: "active",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : null,
      });
      return;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = userIdFromSubscription(sub);
      if (!userId) return;
      await store.upsert(userId, {
        status: mapSubscriptionStatus(sub.status),
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : null,
        stripeSubscriptionId: sub.id,
      });
      return;
    }
    default:
      return;
  }
}
