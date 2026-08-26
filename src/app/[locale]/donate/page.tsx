"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { EmbeddedCheckoutForm } from "@/components/checkout/embedded-checkout";

const PRESETS = [50, 100, 250, 500];

export default function DonatePage() {
  const t = useTranslations("donate");
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
        setError(data.message ?? t("errorFallback"));
        return;
      }
      setClientSecret(data.clientSecret);
    } catch {
      setError(t("errorFallback"));
    } finally {
      setSubmitting(false);
    }
  }

  if (thankYou) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-terminal-pass">{t("thankYou")}</h1>
        <p className="mt-4 font-sans leading-7 text-terminal-muted">{t("thankYouBody")}</p>
        <Link
          href="/donate"
          className="mt-6 inline-block rounded bg-terminal-fg px-6 py-2 font-sans text-terminal-bg hover:bg-terminal-serious"
        >
          {t("anotherDonation")}
        </Link>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("completeTitle")}</h1>
        <p className="mt-2 font-sans text-terminal-muted">
          {t("donationSummary", { frequency: recurring ? t("monthly") : t("oneTime"), amount })}
        </p>
        <div className="mt-6">
          <EmbeddedCheckoutForm clientSecret={clientSecret} submitLabel={t("donate")} />
        </div>
        <button
          type="button"
          onClick={() => setClientSecret(null)}
          className="mt-4 font-sans text-sm text-terminal-muted underline underline-offset-4 hover:text-terminal-fg"
        >
          {t("changeAmount")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">{t("supportTitle")}</h1>
      <p className="mt-4 font-sans text-terminal-muted">{t("supportBody")}</p>

      <div className="mt-6 rounded border border-terminal-pass bg-terminal-surface p-4">
        <p className="font-sans text-sm text-terminal-fg">
          {t.rich("impactNote", {
            strong: (chunks) => <strong className="text-terminal-pass">{chunks}</strong>,
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <fieldset>
          <legend className="font-sans text-sm text-terminal-fg">{t("frequencyLabel")}</legend>
          <div className="mt-2 flex gap-2">
            <label className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
              <input
                type="radio"
                name="frequency"
                checked={!recurring}
                onChange={() => setRecurring(false)}
              />
              {t("oneTime")}
            </label>
            <label className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
              <input
                type="radio"
                name="frequency"
                checked={recurring}
                onChange={() => setRecurring(true)}
              />
              {t("monthly")}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-sans text-sm text-terminal-fg">{t("amountLabel")}</legend>
          <div className="mt-2 flex gap-2">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                aria-pressed={amount === value}
                className={`rounded border px-4 py-2 font-sans ${
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
          <label htmlFor="amount" className="block font-sans text-sm text-terminal-fg">
            {t("customAmount")}
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            max={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-sans text-terminal-fg"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-terminal-fg px-6 py-2 font-sans text-terminal-bg hover:bg-terminal-serious disabled:opacity-50"
        >
          {submitting ? t("preparing") : recurring ? t("donateMonthly") : t("donate")}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
