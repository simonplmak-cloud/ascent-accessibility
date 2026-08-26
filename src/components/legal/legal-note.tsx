import { useTranslations } from "next-intl";

export function LegalNote({ label }: { label?: string }) {
  const t = useTranslations("legal");
  return (
    <p className="mt-6 rounded border border-terminal-border bg-terminal-surface p-3 font-sans text-sm text-terminal-muted">
      {t("legalNote", { label: label ?? t("defaultLabel") })}
    </p>
  );
}
