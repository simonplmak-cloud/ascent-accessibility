"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { OAuthLinkButton } from "@/components/auth/oauth-buttons";

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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("title")}</h1>
      <p className="mt-2 font-sans leading-7 text-terminal-muted">{t("intro")}</p>

      {sent ? (
        <p role="status" className="mt-8 font-sans leading-7 text-terminal-pass">
          {t("sent", { email })}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate={false}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-sans text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg"
            />
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

      <div className="flex flex-col gap-2">
        <OAuthLinkButton provider="github" label={t("github")} />
        <GoogleSignInButton />
        <OAuthLinkButton provider="microsoft" label={t("microsoft")} />
      </div>

      <p className="mt-6 font-sans text-xs text-terminal-muted">{t("cookies")}</p>
    </div>
  );
}
