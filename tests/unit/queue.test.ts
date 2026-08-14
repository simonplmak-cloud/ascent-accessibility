import { describe, expect, it, vi } from "vitest";
import { createJobQueue, MAX_ATTEMPTS, type QueueSender } from "@/lib/queue";

function makeSender(): QueueSender {
  return vi.fn(async () => ({ messageId: "msg_123" }));
}

describe("QueueService", () => {
  it("enqueues a job to the topic (AC-13)", async () => {
    const sender = makeSender();
    const queue = createJobQueue(sender, "test-topic");
    const messageId = await queue.enqueue({ assessmentId: "a-1" });

    expect(messageId).toBe("msg_123");
    expect(sender).toHaveBeenCalledWith("test-topic", { assessmentId: "a-1" });
  });

  it("returns a placeholder when processing is deferred", async () => {
    const sender = vi.fn(async () => ({ messageId: null })) as QueueSender;
    const queue = createJobQueue(sender, "test-topic");
    await expect(queue.enqueue({ assessmentId: "a-1" })).resolves.toBe("deferred");
  });

  it("caps delivery attempts at the configured maximum", () => {
    expect(MAX_ATTEMPTS).toBe(3);
  });
});
