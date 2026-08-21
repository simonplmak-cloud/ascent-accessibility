import type { Metadata } from "next";
import { isReviewer } from "@/server/auth";
import { ReviewQueue } from "@/components/auditor/review-queue";

export const metadata: Metadata = {
  title: "Review queue",
  description: "Review queue for the partner review workforce.",
};

export default async function ReviewPage() {
  if (!(await isReviewer())) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-2xl font-bold text-terminal-fg">Access denied</h1>
        <p className="mt-2 font-mono text-sm text-terminal-muted">
          This area is for the review workforce only.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <ReviewQueue />
    </div>
  );
}
