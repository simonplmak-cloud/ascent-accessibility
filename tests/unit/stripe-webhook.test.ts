import { describe, expect, it, vi } from "vitest";
import {
  handleWebhookEvent,
  mapSubscriptionStatus,
  userIdFromSession,
  userIdFromSubscription,
} from "@/server/stripe-webhook";
import type { SubscriptionStatus } from "@/db/schema";

function makeStore() {
  return {
    upsert: vi.fn(
      async (
        _userId: string,
        _input: {
          status: SubscriptionStatus;
          stripeCustomerId?: string | null;
          stripeSubscriptionId?: string | null;
        },
      ) => ({}),
    ),
  };
}

function sessionEvent(session: Record<string, unknown>) {
  return { type: "checkout.session.completed", data: { object: session } };
}

function subscriptionEvent(type: string, sub: Record<string, unknown>) {
  return { type, data: { object: sub } };
}

describe("mapSubscriptionStatus", () => {
  it("maps active/trialing to active", () => {
    expect(mapSubscriptionStatus("active")).toBe("active");
    expect(mapSubscriptionStatus("trialing")).toBe("active");
  });

  it("maps everything else to inactive", () => {
    for (const s of ["canceled", "unpaid", "incomplete", "past_due", "incomplete_expired"]) {
      expect(mapSubscriptionStatus(s)).toBe("inactive");
    }
  });
});

describe("userId resolution", () => {
  it("reads client_reference_id from a checkout session", () => {
    expect(userIdFromSession({ client_reference_id: "user:abc" } as never)).toBe("user:abc");
    expect(userIdFromSession({} as never)).toBeNull();
  });

  it("reads metadata.userId from a subscription", () => {
    expect(userIdFromSubscription({ metadata: { userId: "user:abc" } } as never)).toBe("user:abc");
    expect(userIdFromSubscription({} as never)).toBeNull();
  });
});

describe("handleWebhookEvent", () => {
  it("activates a subscription on checkout.session.completed", async () => {
    const store = makeStore();
    await handleWebhookEvent(
      sessionEvent({
        client_reference_id: "user:abc",
        customer: "cus_1",
        subscription: "sub_1",
      }) as never,
      store,
    );
    expect(store.upsert).toHaveBeenCalledWith("user:abc", {
      status: "active",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
    });
  });

  it("ignores a checkout session without a client_reference_id (donation)", async () => {
    const store = makeStore();
    await handleWebhookEvent(
      sessionEvent({ customer: "cus_1", mode: "payment" }) as never,
      store,
    );
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("syncs status on customer.subscription.updated", async () => {
    const store = makeStore();
    await handleWebhookEvent(
      subscriptionEvent("customer.subscription.updated", {
        id: "sub_1",
        status: "past_due",
        customer: "cus_1",
        metadata: { userId: "user:abc" },
      }) as never,
      store,
    );
    expect(store.upsert).toHaveBeenCalledWith("user:abc", {
      status: "inactive",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
    });
  });

  it("deactivates on customer.subscription.deleted", async () => {
    const store = makeStore();
    await handleWebhookEvent(
      subscriptionEvent("customer.subscription.deleted", {
        id: "sub_1",
        status: "canceled",
        customer: "cus_1",
        metadata: { userId: "user:abc" },
      }) as never,
      store,
    );
    expect(store.upsert).toHaveBeenCalledWith("user:abc", {
      status: "inactive",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
    });
  });

  it("ignores unknown event types", async () => {
    const store = makeStore();
    await handleWebhookEvent({ type: "payment_intent.succeeded", data: { object: {} } } as never, store);
    expect(store.upsert).not.toHaveBeenCalled();
  });

  it("keeps active status on a trialing subscription", async () => {
    const store = makeStore();
    await handleWebhookEvent(
      subscriptionEvent("customer.subscription.updated", {
        id: "sub_1",
        status: "trialing",
        customer: "cus_1",
        metadata: { userId: "user:abc" },
      }) as never,
      store,
    );
    expect(store.upsert).toHaveBeenCalledWith(
      "user:abc",
      expect.objectContaining({ status: "active" }),
    );
  });
});
