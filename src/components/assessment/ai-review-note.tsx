import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Benefit-driven AI-review status note for the scan page. Rendered server-side;
// the parent resolves whether the signed-in account has a saved AI key.
export async function AiReviewNote({
  hasAiKey,
  providerLabel,
}: {
  hasAiKey: boolean;
  providerLabel?: string | undefined;
}) {
  const t = await getTranslations("assessPage");
  return (
    <div className="mt-6 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <h2 className="font-sans text-sm font-semibold text-terminal-fg">
        {t("aiReviewTitle")}
      </h2>
      <p className="mt-1 font-sans text-sm leading-6 text-terminal-muted">
        {t("aiReviewValue")}
      </p>
      <p className="mt-3 font-sans text-sm">
        {hasAiKey ? (
          <span className="text-terminal-pass">
            {t("aiReviewReady", { provider: providerLabel ?? "OpenRouter" })}
          </span>
        ) : (
          <span className="text-terminal-muted">{t("aiReviewNone")}</span>
        )}{" "}
        <Link
          href="/account"
          className="text-brandLink underline underline-offset-4 hover:text-brand"
        >
          {hasAiKey ? t("manageAiKey") : t("addAiKey")}
        </Link>
      </p>
    </div>
  );
}
