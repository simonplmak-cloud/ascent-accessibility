"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PATH } from "@/lib/training/curriculum";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const t = useTranslations("training");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function complete() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/v1/training/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: PATH.id, activity: lessonId, status: "completed" }),
      });
      if (res.status === 401) {
        setError(t("signInToSave"));
        return;
      }
      if (!res.ok) throw new Error("save failed");
      setDone(true);
    } catch {
      setError(t("couldNotSave"));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="mt-8 font-sans text-sm text-terminal-pass">
        {t("lessonCompleted")}
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      <Button onClick={complete} disabled={saving}>
        {saving ? t("saving") : t("completeContinue")}
      </Button>
      {error && (
        <p role="alert" className="font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
