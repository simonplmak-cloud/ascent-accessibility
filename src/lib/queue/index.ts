export interface AssessmentJobPayload {
  assessmentId: string;
}

export interface JobQueue {
  enqueue(payload: AssessmentJobPayload): Promise<string>;
}

export const MAX_ATTEMPTS = 3;
export const QUEUE_TOPIC = "wcag-score-assessment";

export type QueueSender = (
  topic: string,
  payload: unknown,
) => Promise<{ messageId: string | null }>;

export function createJobQueue(
  sender: QueueSender,
  topic: string = QUEUE_TOPIC,
): JobQueue {
  return {
    async enqueue(payload) {
      const { messageId } = await sender(topic, payload);
      return messageId ?? "deferred";
    },
  };
}
