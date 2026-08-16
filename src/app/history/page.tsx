import type { Metadata } from "next";
import { assessmentRepository } from "@/db/repository";
import { HistoryPageClient } from "@/components/history/history-page-client";
import { getOwnerId } from "@/server/auth";

export const metadata: Metadata = {
  title: "History",
  description: "Your assessment history and scores.",
};

export default async function HistoryPage() {
  const ownerId = await getOwnerId();
  const items = await assessmentRepository.list(ownerId);
  return <HistoryPageClient items={items} />;
}
