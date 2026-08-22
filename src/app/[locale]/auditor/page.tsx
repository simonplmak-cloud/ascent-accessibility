import type { Metadata } from "next";
import { AuditorWorkspace } from "@/components/auditor/auditor-workspace";

export const metadata: Metadata = {
  title: "Auditor workspace",
  description: "Your assessments, review queue, and conformance reports.",
};

export default function AuditorPage() {
  return <AuditorWorkspace />;
}
