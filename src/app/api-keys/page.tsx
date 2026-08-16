import type { Metadata } from "next";
import { apiKeyRepository } from "@/db/repository";
import { ApiKeysClient, type ApiKeySummary } from "@/components/api-keys/api-keys-client";

export const metadata: Metadata = {
  title: "API access",
  description: "Generate and manage API keys for programmatic assessments.",
};

export default async function ApiKeysPage() {
  const keys: ApiKeySummary[] = (await apiKeyRepository.list()).map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    status: key.status,
    rateLimit: key.rateLimit,
  }));

  return <ApiKeysClient keys={keys} />;
}
