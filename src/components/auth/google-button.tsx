"use client";

import { useCallback, useEffect } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

// Google Identity-Services, exposed as a custom-button hook (no iframe
// `renderButton`). `initialize` + the credential callback are unchanged; the
// button click calls `prompt()`. `available` is false when the client id is
// unset, so the caller can omit the Google button.
export function useGoogleSignIn(): { signIn: () => void; available: boolean } {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    if (!clientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });
          if (res.ok) {
            const next = new URLSearchParams(window.location.search).get("next") ?? "/assess";
            window.location.href = next;
          }
        },
      });
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  const signIn = useCallback(() => {
    window.google?.accounts.id.prompt();
  }, []);

  return { signIn, available: Boolean(clientId) };
}
