"use client";

import { useState, type FormEvent } from "react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { useTheme } from "@/lib/use-theme";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// Dark appearance matching the terminal theme. `night` gives a dark base; the
// variables pin each surface to the exact palette so text/contrast stay
// WCAG-compliant on the dark background.
const darkAppearance: Appearance = {
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
    fontFamily: MONO,
    borderRadius: "4px",
  },
};

// Light appearance matching the site's light theme (GitHub Primer values, AAA).
const lightAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#1a7f37",
    colorBackground: "#ffffff",
    colorText: "#1f2328",
    colorTextSecondary: "#59636e",
    colorDanger: "#d1242f",
    colorSuccess: "#1a7f37",
    colorWarning: "#bc4c00",
    buttonColorBackground: "#1a7f37",
    buttonColorText: "#ffffff",
    accessibleColorOnColorPrimary: "#ffffff",
    inputColorBorder: "#d0d7de",
    fontFamily: MONO,
    borderRadius: "4px",
  },
};

function CheckoutForm({ submitLabel }: { submitLabel: string }) {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (checkoutState.type === "loading") {
    return <p className="font-sans text-sm text-terminal-muted">Loading…</p>;
  }
  if (checkoutState.type === "error") {
    return (
      <p role="alert" className="font-sans text-sm text-terminal-critical">
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
        className="w-full rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious disabled:opacity-60"
      >
        {submitting ? "Processing…" : submitLabel}
      </button>
      {message && (
        <p role="alert" className="font-sans text-sm text-terminal-critical">
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
  const { theme } = useTheme();
  const appearance = theme === "dark" ? darkAppearance : lightAppearance;

  return (
    <CheckoutElementsProvider
      key={theme}
      stripe={stripePromise}
      options={{ clientSecret, elementsOptions: { appearance } }}
    >
      <CheckoutForm submitLabel={submitLabel} />
    </CheckoutElementsProvider>
  );
}
