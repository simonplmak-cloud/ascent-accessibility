"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import type { StandardOption } from "@/components/assessment/types";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export function SiteScanClient({ standards }: { standards: StandardOption[] }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  if (!loaded) {
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
        Scan every page of your site — the full sitemap and link crawl. Free for signed-in
        accounts.
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
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-4 font-mono text-sm text-terminal-muted">
            Signed in as {user.email}.
          </p>
          <AssessmentForm standards={standards} fixedScope="site" />
        </div>
      )}
    </div>
  );
}
