"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, useAuth, useUser } from "@clerk/nextjs";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import type { StandardOption } from "@/components/assessment/types";

export function SiteScanClient({ standards }: { standards: StandardOption[] }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setChecking(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          setSubscribed(Boolean(data.subscribed));
        }
      } catch {
        /* ignore */
      } finally {
        setChecking(false);
      }
    })();
  }, [isLoaded, isSignedIn]);

  async function subscribe() {
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    if (!res.ok) {
      setError("Could not start checkout. Please try again.");
      return;
    }
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError("Could not start checkout. Please try again.");
  }

  async function manageSubscription() {
    setError(null);
    const res = await fetch("/api/portal", { method: "POST" });
    if (!res.ok) {
      setError("Could not open the billing portal. Please try again.");
      return;
    }
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError("Could not open the billing portal. Please try again.");
  }

  if (!isLoaded || checking) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="font-mono text-sm text-terminal-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">
        Whole-website assessment
      </h1>
      <p className="mt-2 font-mono leading-7 text-terminal-muted">
        Scan every page of your site — the full sitemap and link crawl. This requires a paid
        subscription, billed in USD.
      </p>

      {!isSignedIn ? (
        <div className="mt-8 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-mono text-sm text-terminal-fg">
            Sign in to run whole-website scans.
          </p>
          <div className="mt-4 flex gap-3">
            <SignInButton mode="modal">
              <button className="rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded border border-terminal-border px-4 py-2 font-mono text-sm text-terminal-fg">
                Create an account
              </button>
            </SignUpButton>
          </div>
        </div>
      ) : !subscribed ? (
        <div className="mt-8 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-mono text-sm text-terminal-fg">
            Welcome, {user?.primaryEmailAddress?.emailAddress ?? "there"}. Whole-website scans
            need an active subscription.
          </p>
          <button
            type="button"
            onClick={subscribe}
            className="mt-4 rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
          >
            Subscribe — US$28/month
          </button>
          {error && (
            <p role="alert" className="mt-3 font-mono text-sm text-terminal-critical">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between rounded border border-terminal-pass bg-terminal-surface p-4">
            <p className="font-mono text-sm text-terminal-fg">
              Subscription active — whole-website scans unlocked.
            </p>
            <button
              type="button"
              onClick={manageSubscription}
              className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-bg"
            >
              Manage subscription
            </button>
          </div>
          {error && (
            <p role="alert" className="mb-4 font-mono text-sm text-terminal-critical">
              {error}
            </p>
          )}
          <AssessmentForm standards={standards} fixedScope="site" />
        </div>
      )}
    </div>
  );
}
