"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { OAuthLinkButton } from "@/components/auth/oauth-buttons";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "sign-up";
  const title = isSignUp ? "Create your account" : "Sign in";
  const submitLabel = isSignUp ? "Create account" : "Sign in";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSignUp ? "/api/auth/sign-up" : "/api/auth/sign-in";
    const body = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next") ?? "/site";
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">{title}</h1>
      <p className="mt-2 font-mono leading-7 text-terminal-muted">
        {isSignUp
          ? "An account unlocks whole-website scans across your entire site."
          : "Sign in to run whole-website scans and see your history."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate={false}>
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block font-mono text-sm text-terminal-fg">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block font-mono text-sm text-terminal-fg">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-mono text-sm text-terminal-fg">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignUp ? 8 : 1}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={isSignUp ? "password-hint" : undefined}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg"
          />
          {isSignUp && (
            <p id="password-hint" className="mt-1 font-mono text-xs text-terminal-muted">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="font-mono text-sm text-terminal-critical">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait…" : submitLabel}
        </Button>
      </form>

      {!isSignUp && (
        <>
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-terminal-border" />
            <span className="font-mono text-xs text-terminal-muted">or</span>
            <span className="h-px flex-1 bg-terminal-border" />
          </div>
          <div className="flex flex-col gap-2">
            <OAuthLinkButton provider="github" label="Sign in with GitHub" />
            <GoogleSignInButton />
            <OAuthLinkButton provider="microsoft" label="Sign in with Microsoft" />
          </div>
        </>
      )}

      <p className="mt-6 font-mono text-sm text-terminal-muted">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <a href="/sign-in" className="text-terminal-fg underline underline-offset-4">
              Sign in
            </a>
          </>
        ) : (
          <>
            Need an account?{" "}
            <a href="/sign-up" className="text-terminal-fg underline underline-offset-4">
              Create one
            </a>
          </>
        )}
      </p>

      <p className="mt-4 font-mono text-xs text-terminal-muted">
        Signing in requires cookies. If you are asked to sign in again right away, your browser is
        blocking cookies — please allow cookies for this site and try again.
      </p>
    </div>
  );
}
