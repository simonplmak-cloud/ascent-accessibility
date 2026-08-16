"use client";

import { useEffect, useState } from "react";
import { EmbeddedCheckoutForm } from "@/components/checkout/embedded-checkout";

const PRESETS = [50, 100, 250, 500];

export default function DonatePage() {
  const [amount, setAmount] = useState(100);
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [thankYou, setThankYou] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1" || params.get("session_id")) {
      setThankYou(true);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, recurring }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        setError(data.message ?? "Payment is temporarily unavailable. Please try again.");
        return;
      }
      setClientSecret(data.clientSecret);
    } catch {
      setError("Payment is temporarily unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (thankYou) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-mono text-3xl font-bold text-terminal-pass">Thank you</h1>
        <p className="mt-4 font-mono leading-7 text-terminal-muted">
          Your support keeps the accessibility assessment tool free and available to everyone. A
          receipt will be emailed to you by Stripe.
        </p>
        <a
          href="/donate"
          className="mt-6 inline-block rounded bg-terminal-fg px-6 py-2 font-mono text-terminal-bg hover:bg-terminal-serious"
        >
          Make another donation
        </a>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-mono text-3xl font-bold text-terminal-fg">Complete your donation</h1>
        <p className="mt-2 font-mono text-terminal-muted">
          {recurring ? "Monthly" : "One-time"} donation of ${amount} USD.
        </p>
        <div className="mt-6">
          <EmbeddedCheckoutForm clientSecret={clientSecret} />
        </div>
        <button
          type="button"
          onClick={() => setClientSecret(null)}
          className="mt-4 font-mono text-sm text-terminal-muted underline underline-offset-4 hover:text-terminal-fg"
        >
          Change amount
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Support the tool</h1>
      <p className="mt-4 font-mono text-terminal-muted">
        Your donation keeps the assessment tool free and available to everyone. Give once, or set
        up a monthly donation.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <fieldset>
          <legend className="font-mono text-sm text-terminal-fg">Frequency</legend>
          <div className="mt-2 flex gap-2">
            <label className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
              <input
                type="radio"
                name="frequency"
                checked={!recurring}
                onChange={() => setRecurring(false)}
              />
              One-time
            </label>
            <label className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
              <input
                type="radio"
                name="frequency"
                checked={recurring}
                onChange={() => setRecurring(true)}
              />
              Monthly
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-sm text-terminal-fg">Amount (USD)</legend>
          <div className="mt-2 flex gap-2">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                aria-pressed={amount === value}
                className={`rounded border px-4 py-2 font-mono ${
                  amount === value
                    ? "border-terminal-serious bg-terminal-surface text-terminal-fg"
                    : "border-terminal-border text-terminal-fg hover:bg-terminal-surface"
                }`}
              >
                ${value}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="amount" className="block font-mono text-sm text-terminal-fg">
            Custom amount (USD)
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            max={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-terminal-fg"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-terminal-fg px-6 py-2 font-mono text-terminal-bg hover:bg-terminal-serious disabled:opacity-50"
        >
          {submitting ? "Preparing…" : recurring ? "Donate monthly" : "Donate"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
