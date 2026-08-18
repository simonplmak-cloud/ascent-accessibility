import type { Metadata } from "next";
import { HistoryPageClient } from "@/components/history/history-page-client";

export const metadata: Metadata = {
  title: "History",
  description: "Your assessment history and conformance results.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
