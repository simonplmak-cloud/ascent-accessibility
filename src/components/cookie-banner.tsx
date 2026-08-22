"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { InlineLink } from "@/components/ui/inline-link";

const CONSENT_COOKIE = "wcag_cookie_consent";

export function CookieBanner() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = document.cookie
      .split("; ")
      .some((c) => c.startsWith(`${CONSENT_COOKIE}=`));
    if (!accepted) setVisible(true);
  }, []);

  function dismiss() {
    document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=31536000; sameSite=lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t("cookieNotice")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-terminal-border bg-terminal-surface p-4"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm text-terminal-muted">
          {t.rich("cookieBody", {
            link: (chunks) => <InlineLink href="/privacy">{chunks}</InlineLink>,
          })}
        </p>
        <Button size="sm" onClick={dismiss}>
          {t("gotIt")}
        </Button>
      </div>
    </div>
  );
}
