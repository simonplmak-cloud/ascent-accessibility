"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { FixSuggestion } from "@/lib/ai-fix";

export interface SuggestFixFindingInput {
  ruleId: string;
  description: string;
  recommendation: string;
  sc?: string | undefined;
  html?: string | undefined;
  target?: string | undefined;
}

// A8: supervised AI fix suggestion. The button asks for a suggestion; the result is
// rendered as text to review — there is deliberately NO "apply" action, and the
// output is always labelled "AI-assisted, not proof of conformance".
export function SuggestFixButton({ finding }: { finding: SuggestFixFindingInput }) {
  const t = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<FixSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const res = await fetch("/api/v1/findings/suggest-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finding),
      });
      const data = (await res.json()) as { suggestion?: FixSuggestion; message?: string };
      if (!res.ok || !data.suggestion) {
        setError(data.message ?? t("noSuggestion"));
      } else {
        setSuggestion(data.suggestion);
      }
    } catch {
      setError(t("noSuggestion"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      {!suggestion && (
        <Button variant="outline" size="sm" onClick={suggest} disabled={loading}>
          {loading ? t("askingAi") : t("suggestFix")}
        </Button>
      )}

      {error && (
        <p role="alert" className="mt-2 font-sans text-xs text-terminal-critical">
          {error}
        </p>
      )}

      {suggestion && (
        <div className="mt-2 rounded border border-terminal-border bg-terminal-surface/40 p-3">
          <p className="font-sans text-xs font-semibold text-terminal-serious">
            {t("aiAssistedNote")}
          </p>
          <p className="mt-2 font-sans text-sm text-terminal-fg">
            <span className="font-semibold">{t("fixLabel")}</span> {suggestion.fix}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            {t("confidenceLabel")} {Math.round(suggestion.confidence * 100)}%
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">{t("whyLabel")}</span> {suggestion.why}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">{t("avoidLabel")}</span> {suggestion.avoid}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">{t("verifyLabel")}</span> {suggestion.verify}
          </p>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="mt-2 font-sans text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
          >
            {t("dismiss")}
          </button>
        </div>
      )}
    </div>
  );
}
