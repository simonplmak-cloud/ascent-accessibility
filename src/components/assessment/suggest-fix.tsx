"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FixSuggestion } from "@/lib/ai-fix";

export interface SuggestFixFindingInput {
  ruleId: string;
  description: string;
  recommendation: string;
  sc?: string;
  html?: string;
  target?: string;
}

// A8: supervised AI fix suggestion. The button asks for a suggestion; the result is
// rendered as text to review — there is deliberately NO "apply" action, and the
// output is always labelled "AI-assisted, not proof of conformance".
export function SuggestFixButton({ finding }: { finding: SuggestFixFindingInput }) {
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
        setError(data.message ?? "Could not get a suggestion right now.");
      } else {
        setSuggestion(data.suggestion);
      }
    } catch {
      setError("Could not get a suggestion right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      {!suggestion && (
        <Button variant="outline" size="sm" onClick={suggest} disabled={loading}>
          {loading ? "Asking AI…" : "Suggest fix (AI)"}
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
            AI-assisted suggestion — review before applying; not proof of conformance.
          </p>
          <p className="mt-2 font-sans text-sm text-terminal-fg">
            <span className="font-semibold">Fix:</span> {suggestion.fix}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            Confidence: {Math.round(suggestion.confidence * 100)}%
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">Why:</span> {suggestion.why}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">Avoid:</span> {suggestion.avoid}
          </p>
          <p className="mt-1 font-sans text-xs text-terminal-muted">
            <span className="text-terminal-fg">Verify:</span> {suggestion.verify}
          </p>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="mt-2 font-sans text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
