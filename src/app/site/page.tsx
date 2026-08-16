import { listStandards } from "@/lib/standards/catalog";
import { SiteScanClient } from "@/components/site/site-scan-client";

export default function SitePage() {
  const standards = listStandards().map((s) => ({ id: s.id, name: s.name }));
  return <SiteScanClient standards={standards} />;
}
