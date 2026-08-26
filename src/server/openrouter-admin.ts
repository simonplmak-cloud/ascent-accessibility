// OpenRouter Management API client. Requires OPENROUTER_MANAGEMENT_KEY — an
// admin-only key that provisions per-user keys but cannot make completion calls.
const BASE_URL = "https://openrouter.ai/api/v1";

export interface ProvisionedKey {
  hash: string;
  key: string; // returned exactly once at creation
  limitUsd: number | null;
  limitRemainingUsd: number | null;
}

function managementKey(): string {
  const key = process.env.OPENROUTER_MANAGEMENT_KEY;
  if (!key) throw new Error("OPENROUTER_MANAGEMENT_KEY is not set");
  return key;
}

interface CreateKeyResponse {
  data: { hash: string; limit: number | null; limit_remaining: number | null };
  key: string;
}

export async function createOpenRouterKey(
  input: { name: string; limitUsd: number },
  fetchFn: typeof fetch = fetch,
): Promise<ProvisionedKey> {
  const res = await fetchFn(`${BASE_URL}/keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${managementKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: input.name, limit: input.limitUsd }),
  });
  if (!res.ok) throw new Error(`OpenRouter create key failed (${res.status})`);
  const json = (await res.json()) as CreateKeyResponse;
  return {
    hash: json.data.hash,
    key: json.key,
    limitUsd: json.data.limit,
    limitRemainingUsd: json.data.limit_remaining,
  };
}

export async function updateOpenRouterKey(
  hash: string,
  input: { limitUsd?: number; disabled?: boolean },
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.limitUsd !== undefined) body.limit = input.limitUsd;
  if (input.disabled !== undefined) body.disabled = input.disabled;
  const res = await fetchFn(`${BASE_URL}/keys/${hash}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${managementKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenRouter update key failed (${res.status})`);
}
