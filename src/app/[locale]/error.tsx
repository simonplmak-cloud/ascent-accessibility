"use client";

import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">
        {t("somethingWentWrong")}
      </h1>
      <p className="mt-4 font-sans leading-7 text-terminal-muted">
        {t("unexpectedError")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-terminal-fg px-4 py-2 font-sans text-sm text-terminal-bg hover:bg-terminal-serious"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
