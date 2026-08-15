import { listStandards } from "@/lib/standards/catalog";
import { SiteScanClient } from "@/components/site/site-scan-client";

export default function SitePage() {
  const standards = listStandards().map((s) => ({ id: s.id, name: s.name }));
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkConfigured) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-3xl font-bold text-terminal-fg">
          Whole-website assessment
        </h1>
        <p className="mt-4 font-mono leading-7 text-terminal-muted">
          Whole-website scans require a subscriber account. Account sign-up is not yet
          configured for this deployment.
        </p>
      </div>
    );
  }

  return <SiteScanClient standards={standards} />;
}
