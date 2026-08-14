export interface AssessmentJobPayload {
  assessmentId: string;
}

export interface JobQueueClient {
  publishJSON(request: {
    url: string;
    body: unknown;
    retries?: number;
  }): Promise<{ messageId: string }>;
}

export interface JobQueue {
  enqueue(payload: AssessmentJobPayload): Promise<string>;
}

export const MAX_ATTEMPTS = 3;

export function createJobQueue(client: JobQueueClient, workerUrl: string): JobQueue {
  return {
    async enqueue(payload) {
      const response = await client.publishJSON({
        url: workerUrl,
        body: payload,
        retries: MAX_ATTEMPTS,
      });
      return response.messageId;
    },
  };
}
