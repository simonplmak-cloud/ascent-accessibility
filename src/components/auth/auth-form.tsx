"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function AuthForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? t("errGeneric"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("errGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded border border-terminal-border bg-terminal-surface/40 p-6 sm:p-8">
      {sent ? (
        <p role="status" className="font-sans leading-7 text-terminal-pass">
          {t("sent", { email })}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
          <div>
            <label htmlFor="email" className="block font-sans text-sm text-terminal-fg">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-describedby="email-hint"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-sans text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg"
            />
            <p id="email-hint" className="mt-1 font-sans text-xs text-terminal-muted">
              {t("hint")}
            </p>
          </div>

          {error && (
            <p role="alert" className="font-sans text-sm text-terminal-critical">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("sending") : t("submit")}
          </Button>
        </form>
      )}

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-terminal-border" />
        <span className="font-sans text-xs text-terminal-muted">{t("or")}</span>
        <span className="h-px flex-1 bg-terminal-border" />
      </div>

      <OAuthButtons />

      <p className="mt-6 font-sans text-xs text-terminal-muted">{t("cookies")}</p>
    </div>
  );
}
