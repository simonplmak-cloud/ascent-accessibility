"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import { EmbeddedCheckoutForm } from "@/components/checkout/embedded-checkout";
import { Button } from "@/components/ui/button";
import type { StandardOption } from "@/components/assessment/types";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export function SiteScanClient({ standards }: { standards: StandardOption[] }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) {
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
  }, [user]);

  async function subscribe() {
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    if (!res.ok) {
      setError("Could not start checkout. Please try again.");
      return;
    }
    const data = await res.json();
    if (data.clientSecret) setClientSecret(data.clientSecret);
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

  async function signOut() {
    setError(null);
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    setSubscribed(false);
  }

  if (!loaded || (user && checking)) {
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

      {!user ? (
        <div className="mt-8 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-mono text-sm text-terminal-fg">
            Sign in to run whole-website scans.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/sign-in"
              className="rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded border border-terminal-border px-4 py-2 font-mono text-sm text-terminal-fg"
            >
              Create an account
            </Link>
          </div>
        </div>
      ) : !subscribed ? (
        clientSecret ? (
          <div className="mt-8">
            <p className="mb-4 font-mono text-sm text-terminal-fg">
              Complete your subscription — US$28/month, billed in USD.
            </p>
            <EmbeddedCheckoutForm clientSecret={clientSecret} submitLabel="Subscribe" />
            <button
              type="button"
              onClick={() => setClientSecret(null)}
              className="mt-4 font-mono text-sm text-terminal-muted underline underline-offset-4 hover:text-terminal-fg"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-8 rounded border border-terminal-border bg-terminal-surface p-6">
            <p className="font-mono text-sm text-terminal-fg">
              Welcome, {user.email}. Whole-website scans need an active subscription.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={subscribe}>Subscribe — US$28/month</Button>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
            {error && (
              <p role="alert" className="mt-3 font-mono text-sm text-terminal-critical">
                {error}
              </p>
            )}
          </div>
        )
      ) : (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4 rounded border border-terminal-pass bg-terminal-surface p-4">
            <p className="font-mono text-sm text-terminal-fg">
              Subscription active — whole-website scans unlocked.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={manageSubscription}>
                Manage subscription
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
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
