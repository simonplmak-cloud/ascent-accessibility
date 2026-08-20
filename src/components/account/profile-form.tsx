"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AiModel {
  id: string;
  label: string;
}

interface AiProvider {
  id: string;
  label: string;
  apiFormat: string;
  visionModels: AiModel[];
  audioModels: AiModel[];
}

export function ProfileForm() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [provider, setProvider] = useState("openrouter");
  const [baseUrl, setBaseUrl] = useState("");
  const [visionModel, setVisionModel] = useState("");
  const [audioModel, setAudioModel] = useState("");
  const [key, setKey] = useState("");
  const [masked, setMasked] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [keyRes, modelsRes] = await Promise.all([
          fetch("/api/account/ai-key"),
          fetch("/api/account/models"),
        ]);
        if (keyRes.ok) {
          const k = await keyRes.json();
          if (k.set) {
            setMasked(k.masked);
            if (k.provider) setProvider(k.provider);
          }
        }
        if (modelsRes.ok) {
          const m = await modelsRes.json();
          setProviders(m.providers ?? []);
          if (m.provider) setProvider(m.provider);
          if (m.baseUrl) setBaseUrl(m.baseUrl);
          if (m.visionModel) setVisionModel(m.visionModel);
          if (m.audioModel) setAudioModel(m.audioModel);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const current = providers.find((p) => p.id === provider);

  async function saveKey() {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/account/ai-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: key, provider, baseUrl }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setMasked(data.masked);
      setKey("");
      setMessage("Key saved.");
    } else {
      setError(data?.code ?? "Failed to save key.");
    }
  }

  async function removeKey() {
    setMessage(null);
    setError(null);
    await fetch("/api/account/ai-key", { method: "DELETE" });
    setMasked(null);
    setKey("");
    setMessage("Key removed.");
  }

  async function saveModels() {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/account/models", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, baseUrl, visionModel, audioModel }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setMessage("Model preferences saved.");
    } else {
      setError(data?.code ?? "Failed to save models.");
    }
  }

  const inputClass =
    "mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-sm text-terminal-fg focus:outline-none focus:ring-2 focus:ring-terminal-fg";

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-mono text-lg font-bold text-terminal-fg">AI review key (BYOK)</h2>
        <p className="font-mono text-sm text-terminal-muted">
          Bring your own key for any supported provider. Stored encrypted; AI review runs only on
          your key — the platform never pays for your tokens.
        </p>

        {masked && (
          <p className="font-mono text-sm text-terminal-pass">
            Current key: <span className="text-terminal-fg">{masked}</span> ({provider})
          </p>
        )}

        <div>
          <label htmlFor="provider" className="block font-mono text-sm text-terminal-fg">
            Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={inputClass}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {provider === "custom" && (
          <div>
            <label htmlFor="baseUrl" className="block font-mono text-sm text-terminal-fg">
              Base URL (https)
            </label>
            <input
              id="baseUrl"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="apiKey" className="block font-mono text-sm text-terminal-fg">
            API key
          </label>
          <input
            id="apiKey"
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-…"
            className={inputClass}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={saveKey} disabled={!key}>
            Save key
          </Button>
          {masked && (
            <Button variant="outline" onClick={removeKey}>
              Remove key
            </Button>
          )}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-mono text-lg font-bold text-terminal-fg">Models</h2>

        <div>
          <label htmlFor="visionModel" className="block font-mono text-sm text-terminal-fg">
            Vision model
          </label>
          <select
            id="visionModel"
            value={visionModel}
            onChange={(e) => setVisionModel(e.target.value)}
            className={inputClass}
          >
            <option value="">Default (Qwen)</option>
            {(current?.visionModels ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audioModel" className="block font-mono text-sm text-terminal-fg">
            Voice / audio model
          </label>
          <select
            id="audioModel"
            value={audioModel}
            onChange={(e) => setAudioModel(e.target.value)}
            className={inputClass}
          >
            <option value="">Default</option>
            {(current?.audioModels ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {current && current.audioModels.length === 0 && (
            <p className="mt-1 font-mono text-xs text-terminal-muted">
              This provider has no audio model — media success criteria stay &ldquo;Cannot tell&rdquo;.
            </p>
          )}
        </div>

        <Button onClick={saveModels}>Save models</Button>
      </Card>

      {message && (
        <p role="status" className="font-mono text-sm text-terminal-pass">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
