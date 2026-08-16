import type { Metadata } from "next";
import Link from "next/link";
import { apiKeyRepository, subscriptionRepository } from "@/db/repository";
import { ApiKeysClient, type ApiKeySummary } from "@/components/api-keys/api-keys-client";
import { getUserId } from "@/server/auth";

export const metadata: Metadata = {
  title: "API access",
  description: "Generate and manage API keys for programmatic assessments.",
};

export default async function ApiKeysPage() {
  const userId = await getUserId();

  if (!userId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-2xl font-bold text-terminal-fg">API access</h1>
        <p className="mt-4 font-mono leading-7 text-terminal-muted">
          Sign in to manage API keys for programmatic assessments.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const subscribed = await subscriptionRepository.isActive(userId);
  if (!subscribed) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-2xl font-bold text-terminal-fg">API access</h1>
        <p className="mt-4 font-mono leading-7 text-terminal-muted">
          API access is available to subscribers. Subscribe to generate API keys for programmatic
          assessments.
        </p>
        <Link
          href="/site"
          className="mt-6 inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
        >
          Subscribe
        </Link>
      </div>
    );
  }

  const keys: ApiKeySummary[] = (await apiKeyRepository.list(userId)).map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    status: key.status,
    rateLimit: key.rateLimit,
  }));

  return <ApiKeysClient keys={keys} />;
}
