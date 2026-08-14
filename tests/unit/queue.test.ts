import { describe, expect, it, vi } from "vitest";
import { createJobQueue, MAX_ATTEMPTS, type JobQueueClient } from "@/lib/queue";

function makeClient(): JobQueueClient {
  return {
    publishJSON: vi.fn(async () => ({ messageId: "msg_123" })),
  };
}

describe("QueueService", () => {
  it("enqueues a job to the worker URL with retries (AC-13/AC-14)", async () => {
    const client = makeClient();
    const queue = createJobQueue(client, "https://app.example.com/api/jobs/run");
    const messageId = await queue.enqueue({ assessmentId: "a-1" });

    expect(messageId).toBe("msg_123");
    expect(client.publishJSON).toHaveBeenCalledWith({
      url: "https://app.example.com/api/jobs/run",
      body: { assessmentId: "a-1" },
      retries: MAX_ATTEMPTS,
    });
  });

  it("caps delivery attempts at the configured maximum", () => {
    expect(MAX_ATTEMPTS).toBe(3);
  });
});
