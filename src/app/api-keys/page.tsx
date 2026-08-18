import type { Metadata } from "next";
import { ApiKeysClient } from "@/components/api-keys/api-keys-client";

export const metadata: Metadata = {
  title: "API access",
  description: "Generate and manage API keys for programmatic assessments.",
};

export default function ApiKeysPage() {
  return <ApiKeysClient />;
}
