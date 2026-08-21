"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PATH } from "@/lib/training/curriculum";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
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
        setError("Sign in to save your progress.");
        return;
      }
      if (!res.ok) throw new Error("save failed");
      setDone(true);
    } catch {
      setError("Could not save progress.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="mt-8 font-mono text-sm text-terminal-pass">
        Lesson completed ✓
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      <Button onClick={complete} disabled={saving}>
        {saving ? "Saving…" : "Complete & continue"}
      </Button>
      {error && (
        <p role="alert" className="font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}
    </div>
  );
}
