import type { Metadata } from "next";
import { assessmentRepository } from "@/db/repository";
import { HistoryPageClient } from "@/components/history/history-page-client";

export const metadata: Metadata = {
  title: "History",
  description: "Your assessment history and scores.",
};

export default async function HistoryPage() {
  const items = await assessmentRepository.list();
  return <HistoryPageClient items={items} />;
}
