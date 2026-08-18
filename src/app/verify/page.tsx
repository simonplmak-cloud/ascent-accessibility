"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"pending" | "ok" | "error">("pending");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    (async () => {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "ok" : "error");
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-2xl font-bold text-terminal-fg">Email verification</h1>
      {state === "pending" && (
        <p className="mt-3 font-mono text-terminal-muted">Verifying…</p>
      )}
      {state === "ok" && (
        <>
          <p className="mt-3 font-mono text-terminal-fg">
            Your email is verified. You can now run assessments.
          </p>
          <p className="mt-4">
            <Link href="/assess" className="font-mono text-terminal-fg underline underline-offset-4 hover:text-terminal-serious">
              Start an assessment
            </Link>
          </p>
        </>
      )}
      {state === "error" && (
        <p className="mt-3 font-mono text-terminal-critical">
          This verification link is invalid or has expired. Please sign in and request a new one.
        </p>
      )}
    </div>
  );
}
