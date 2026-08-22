"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSc, scTitle, understandingUrl } from "@/lib/standards/wcag-sc";
import { linksForSc } from "@/lib/sc-links";
import { impactColor } from "./severity";
import { impactLabel } from "@/lib/labels";
import { SuggestFixButton } from "./suggest-fix";
import type { Finding } from "./types";

function confidenceClass(confidence?: string): string {
  return confidence === "confirmed" ? "text-terminal-pass" : "text-terminal-muted";
}

function evidenceUrl(assessmentId: string, evidenceId: string): string {
  return `/api/v1/assessments/${assessmentId}/evidence/${encodeURIComponent(evidenceId)}`;
}

export function FindingEvidence({
  finding,
  assessmentId,
}: {
  finding: Finding;
  assessmentId: string;
}) {
  const t = useTranslations("report");
  const locale = useLocale();
  const sc = finding.wcagSc?.[0];
  const scInfo = sc ? getSc(sc) : undefined;
  const links = sc ? linksForSc(sc, locale) : null;
  const instances = finding.instances ?? [];

  return (
    <article className="mt-4 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`font-sans text-xs font-semibold uppercase ${impactColor(finding.impact)}`}>
          {impactLabel(finding.impact, locale)}
        </span>
        {sc && scInfo && (
          <a
            href={understandingUrl(scInfo)}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
          >
            WCAG {sc} · {scTitle(sc, locale)} ({t("levelLabel", { level: scInfo.level })})
            <span className="sr-only">{t("opensNewWindow")}</span>
          </a>
        )}
        {!sc && (
          <span className="font-sans text-xs text-terminal-muted">{t("bestPractice")}</span>
        )}
        {finding.confidence && (
          <span className={`font-sans text-xs ${confidenceClass(finding.confidence)}`}>
            {finding.confidence === "confirmed" ? t("confirmedBy2") : t("singleSource")}
          </span>
        )}
      </div>

      <p className="mt-2 font-sans text-sm text-terminal-fg">{finding.description}</p>
      <p className="mt-1 font-sans text-xs text-terminal-muted">{finding.pageUrl}</p>

      {finding.sources && finding.sources.length > 0 && (
        <p className="mt-2 font-sans text-xs text-terminal-muted">
          {t("detectedBy")}{" "}
          {[...new Set(finding.sources.map((s) => s.tool))].map((t) => t.toUpperCase()).join(", ")}
        </p>
      )}

      {instances.length > 0 && (
        <div className="mt-3 space-y-3">
          {instances.slice(0, 5).map((instance, i) => (
            <div key={i} className="rounded border border-terminal-border p-3">
              {instance.target && (
                <code className="block break-all font-mono text-xs text-terminal-muted">
                  {instance.target}
                </code>
              )}
              {instance.html && (
                <code className="mt-1 block overflow-x-auto whitespace-pre-wrap break-all rounded bg-terminal-bg p-2 font-mono text-xs text-terminal-fg">
                  {instance.html}
                </code>
              )}
              {instance.failureSummary && (
                <p className="mt-1 font-sans text-xs text-terminal-serious">{instance.failureSummary}</p>
              )}
              {instance.evidenceId && (
                <img
                  src={evidenceUrl(assessmentId, instance.evidenceId)}
                  alt={t("screenshotAlt", { ruleId: finding.ruleId, pageUrl: finding.pageUrl })}
                  className="mt-2 max-h-64 rounded border border-terminal-border"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 font-sans text-sm text-terminal-fg">
        <span className="text-terminal-serious">{t("fixLabel")}</span> {finding.recommendation}
      </p>

      {links && (
        <div className="mt-3 space-y-1 border-t border-terminal-border pt-3 font-sans text-xs">
          <p className="text-terminal-muted">
            <span className="text-terminal-fg">{t("verifyManually")}</span> {links.manualTest}
          </p>
          {links.lessonHref && (
            <p>
              <Link
                href={links.lessonHref}
                className="text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
              >
                {t("learnLesson")}
              </Link>
            </p>
          )}
        </div>
      )}

      <SuggestFixButton
        finding={{
          ruleId: finding.ruleId,
          description: finding.description,
          recommendation: finding.recommendation,
          sc,
          html: instances[0]?.html,
          target: instances[0]?.target,
        }}
      />
    </article>
  );
}
