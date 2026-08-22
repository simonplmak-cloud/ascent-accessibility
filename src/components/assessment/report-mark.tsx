"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// The shareable "Mark": a badge image plus copy-paste embed snippets (Markdown +
// HTML) for ESG reports and other materials. The badge links to the public report,
// so the claim is verifiable; it turns green only when human-verified.
export function ReportMark({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations("report");
  const [copied, setCopied] = useState<string | null>(null);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const badgeUrl = `${base}/api/v1/assessments/${assessmentId}/badge.svg`;
  const reportUrl = `${base}/auditor/report/${encodeURIComponent(assessmentId)}`;

  const snippets: Array<{ label: string; code: string }> = [
    { label: "Markdown", code: `[![Accessibility mark](${badgeUrl})](${reportUrl})` },
    { label: "HTML", code: `<a href="${reportUrl}"><img src="${badgeUrl}" alt="Accessibility mark"></a>` },
  ];

  async function copy(code: string, label: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard unavailable — the code is still selectable below.
    }
  }

  return (
    <section aria-labelledby="mark-heading" className="mt-8">
      <h2 id="mark-heading" className="font-display text-base font-semibold text-terminal-fg">
        {t("markHeading")}
      </h2>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("markIntro")}
      </p>
      <p className="mt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt={t("markAlt")} className="inline-block" />
      </p>
      <div className="mt-3 space-y-3">
        {snippets.map((snippet) => (
          <div key={snippet.label}>
            <p className="font-sans text-xs text-terminal-muted">{snippet.label}</p>
            <div className="mt-1 flex items-start gap-2">
              <code className="block flex-1 overflow-x-auto rounded bg-terminal-bg p-2 font-mono text-xs text-terminal-fg">
                {snippet.code}
              </code>
              <Button variant="outline" size="sm" onClick={() => copy(snippet.code, snippet.label)}>
                {copied === snippet.label ? t("copied") : t("copy")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
