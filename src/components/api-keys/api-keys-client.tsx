"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface ApiKeySummary {
  id: string;
  name: string;
  keyPrefix: string;
  status: "active" | "revoked";
  rateLimit: number;
}

export function ApiKeysClient({ keys }: { keys: ApiKeySummary[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rateLimit, setRateLimit] = useState(60);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rateLimit }),
      });
      if (!res.ok) throw new Error("create failed");
      const issued = await res.json();
      setIssuedKey(issued.key);
      setName("");
      router.refresh();
    } catch {
      setError("Could not create a key.");
    }
  }

  async function revoke(id: string) {
    setError(null);
    setNotice(null);
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("revoke failed");
      setNotice("Key revoked.");
      router.refresh();
    } catch {
      setError("Could not revoke that key.");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-mono text-2xl font-bold text-terminal-fg">API access</h1>
      <p className="mt-1 font-mono text-sm text-terminal-muted">
        Generate and manage API keys to run assessments programmatically.
      </p>

      {issuedKey && (
        <div role="status" className="mt-6 rounded border border-terminal-pass p-4">
          <p className="font-mono text-sm text-terminal-fg">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block break-all rounded bg-terminal-surface p-3 font-mono text-sm text-terminal-pass">
            {issuedKey}
          </code>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 font-mono text-sm text-terminal-pass">
          {notice}
        </p>
      )}

      <form onSubmit={createKey} className="mt-6 space-y-4 rounded border border-terminal-border p-4">
        <div>
          <label htmlFor="key-name" className="block font-mono text-sm text-terminal-fg">
            Key name
          </label>
          <input
            id="key-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="CI / Staging / Local dev"
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-terminal-fg placeholder:text-terminal-muted"
          />
        </div>
        <div>
          <label htmlFor="key-rate" className="block font-mono text-sm text-terminal-fg">
            Rate limit (requests/min)
          </label>
          <input
            id="key-rate"
            type="number"
            min={1}
            value={rateLimit}
            onChange={(e) => setRateLimit(Number(e.target.value))}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-terminal-fg"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-terminal-fg px-6 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          Create key
        </button>
      </form>

      <div className="mt-8">
        <h2 className="font-mono text-lg font-semibold text-terminal-fg">Your keys</h2>
        {keys.length === 0 ? (
          <p className="mt-4 font-mono text-sm text-terminal-muted">No API keys yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-terminal-border text-left text-terminal-muted">
                  <th scope="col" className="px-3 py-2 font-medium">Name</th>
                  <th scope="col" className="px-3 py-2 font-medium">Key</th>
                  <th scope="col" className="px-3 py-2 font-medium">Rate limit</th>
                  <th scope="col" className="px-3 py-2 font-medium">Status</th>
                  <th scope="col" className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-terminal-border last:border-b-0">
                    <td className="px-3 py-2 text-terminal-fg">{key.name}</td>
                    <td className="px-3 py-2 text-terminal-muted">{key.keyPrefix}…</td>
                    <td className="px-3 py-2 text-terminal-muted">{key.rateLimit}/min</td>
                    <td className="px-3 py-2">
                      <span className={key.status === "active" ? "text-terminal-pass" : "text-terminal-muted"}>
                        {key.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {key.status === "active" && (
                        <button
                          type="button"
                          onClick={() => revoke(key.id)}
                          disabled={busyIds.has(key.id)}
                          aria-label={`Revoke API key ${key.name}`}
                          className="text-terminal-critical underline-offset-4 hover:underline disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
