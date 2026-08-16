"use client";

import { useState, type FormEvent } from "react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

// Dark-mode appearance matching the site's terminal theme (tailwind terminal.*).
// The `night` theme gives a dark base; the variables pin each surface to the
// exact palette so text/contrast stay WCAG-compliant on the dark background.
const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#3fb950",
    colorBackground: "#0b0f14",
    colorText: "#e6edf3",
    colorTextSecondary: "#9da7b0",
    colorDanger: "#ff7b72",
    colorSuccess: "#3fb950",
    colorWarning: "#ffa657",
    buttonColorBackground: "#3fb950",
    buttonColorText: "#0b0f14",
    accessibleColorOnColorPrimary: "#0b0f14",
    inputColorBorder: "#2a3542",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    borderRadius: "4px",
  },
};

function CheckoutForm({ submitLabel }: { submitLabel: string }) {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (checkoutState.type === "loading") {
    return <p className="font-mono text-sm text-terminal-muted">Loading…</p>;
  }
  if (checkoutState.type === "error") {
    return (
      <p role="alert" className="font-mono text-sm text-terminal-critical">
        {checkoutState.error.message}
      </p>
    );
  }

  const { checkout } = checkoutState;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const result = await checkout.confirm();
    if (result.type === "error") {
      setMessage(result.error.message);
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious disabled:opacity-60"
      >
        {submitting ? "Processing…" : submitLabel}
      </button>
      {message && (
        <p role="alert" className="font-mono text-sm text-terminal-critical">
          {message}
        </p>
      )}
    </form>
  );
}

export function EmbeddedCheckoutForm({
  clientSecret,
  submitLabel,
}: {
  clientSecret: string;
  submitLabel: string;
}) {
  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret, elementsOptions: { appearance } }}
    >
      <CheckoutForm submitLabel={submitLabel} />
    </CheckoutElementsProvider>
  );
}
