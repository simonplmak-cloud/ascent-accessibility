"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  useEffect(() => {
    if (!clientId || !ref.current) return;
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
      window.google?.accounts.id.renderButton(ref.current!, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        width: 400,
      });
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={ref} className="flex justify-center" />;
}
