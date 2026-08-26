"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ClaimCertificateButton({
  path,
  pathVersion,
  score,
}: {
  path: string;
  pathVersion: string;
  score: number | null;
}) {
  const t = useTranslations("training");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function claim() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/v1/training/credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          pathVersion,
          score,
          completedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        setError(t("couldNotIssue"));
        return;
      }
      const data = (await res.json()) as { credential: { id: string } };
      router.push(`/training/certificate/${data.credential.id}`);
    } catch {
      setError(t("couldNotIssue"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={claim} disabled={busy}>
        {busy ? t("issuing") : t("claimCertificate")}
      </Button>
      {error && (
        <p role="alert" className="font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
