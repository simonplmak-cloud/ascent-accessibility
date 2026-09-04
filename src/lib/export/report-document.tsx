import React from "react";
import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Link,
  renderToBuffer,
} from "@react-pdf/renderer";
import { BRANDING } from "@/lib/site/branding";
import { aiResults, notTestedRows, machineResults } from "@/lib/report/report-methods";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { principleName, scTitle } from "@/lib/standards/wcag-sc";
import { impactLabel, outcomeLabel, verdictLabel } from "@/lib/site/labels";
import { buildReportSummary } from "@/lib/report/report-summary";
import { vpatLevelOf, testedByOf, vpatLabelKey, acrRemarks, acrIdentity, type TestedBy } from "./acr";
import type { ReportStrings } from "./i18n";
import {
  affectedSuccessCriteria,
  generatedDate,
  groupFindingsBySeverity,
  outcomeColor,
  severityColor,
  severityCounts,
  topIssues,
  SEVERITY_ORDER,
  type SeverityCounts,
} from "./report-data";
import type { ReportData } from "./types";

const TESTED_BY_KEY: Record<TestedBy, string> = {
  machine: "machine",
  ai: "ai",
  human: "human",
  notTested: "notTested",
  dash: "dash",
};

const PAGE_STATUS_KEY: Record<string, string> = {
  scanned: "pageStatusScanned",
  failed: "pageStatusFailed",
  skipped: "pageStatusSkipped",
};

const SIGNAL_KEY: Record<string, string> = {
  performance: "signalPerformance",
  seo: "signalSeo",
  bestPractices: "signalBestPractices",
  pwa: "signalPwa",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontSize: 10,
    color: "#1f2328",
  },
  // Cover
  cover: { alignItems: "center", textAlign: "center", paddingTop: 40 },
  logo: { height: 48, objectFit: "contain" },
  org: { fontSize: 18, fontWeight: 700, marginTop: 16 },
  sub: { fontSize: 10, color: "#59636e", marginTop: 4 },
  coverTitle: { fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 20 },
  coverMeta: { fontSize: 11, marginTop: 8 },
  verdict: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  disclaimer: { fontSize: 8, color: "#59636e", marginTop: 20, maxWidth: 320 },
  // Headings
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8, color: "#1f2328" },
  h3: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  section: { marginBottom: 8 },
  muted: { color: "#59636e" },
  empty: { color: "#59636e", fontStyle: "italic" },
  // TOC
  tocItem: { fontSize: 12, marginBottom: 8 },
  // Tables
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tableHead: { backgroundColor: "#f6f8fa", fontWeight: 700 },
  tableCell: { padding: 4, fontSize: 9 },
  // Severity tag
  sevTag: { fontSize: 8, color: "#ffffff", padding: 2, borderRadius: 2, fontWeight: 700, textTransform: "uppercase" },
  // Legend
  legend: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  legendItem: { fontSize: 8, marginRight: 10 },
  // Footer
  pageNumber: { position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#59636e" },
  // Colophon
  colophon: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10, fontSize: 8, color: "#59636e", flexDirection: "row", justifyContent: "space-between" },
  // Evidence
  codeBlock: { fontFamily: "Courier", fontSize: 8, backgroundColor: "#f6f8fa", padding: 4, marginTop: 2 },
  evidenceImage: { marginTop: 4, maxHeight: 260, objectFit: "contain" },
});

function SeverityBars({ counts, locale }: { counts: SeverityCounts; locale: string }) {
  const max = Math.max(1, ...SEVERITY_ORDER.map((s) => counts[s]));
  return (
    <View>
      {SEVERITY_ORDER.map((sev) => {
        const count = counts[sev];
        const pct = count === 0 ? 0 : Math.max(3, (count / max) * 100);
        const color = severityColor(sev);
        return (
          <View key={sev} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ width: 70, fontSize: 9 }}>{impactLabel(sev, locale)}</Text>
            <View style={{ flex: 1, height: 12, backgroundColor: "#e5e7eb", borderRadius: 3 }}>
              <View style={{ width: `${pct}%`, height: 12, backgroundColor: color, borderRadius: 3 }} />
            </View>
            <Text style={{ width: 34, textAlign: "right", fontSize: 9, color, fontWeight: 700 }}>
              {String(count)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ConformanceBar({ c }: { c: { passed: number; failed: number; notPresent: number; notTested: number } }) {
  const total = c.passed + c.failed + c.notPresent + c.notTested;
  if (total <= 0) return <Text style={styles.empty}>—</Text>;

  const segments = [
    { label: "Passed", value: c.passed, color: "#1a7f37" },
    { label: "Failed", value: c.failed, color: "#d1242f" },
    { label: "Not present", value: c.notPresent, color: "#d0d7de" },
    { label: "Not tested", value: c.notTested, color: "#9a6700" },
  ].filter((s) => s.value > 0);

  return (
    <View>
      <View style={{ flexDirection: "row", height: 18 }}>
        {segments.map((s, i) => (
          <View key={i} style={{ flex: s.value, backgroundColor: s.color }} />
        ))}
      </View>
      <View style={styles.legend}>
        {segments.map((s) => (
          <Text key={s.label} style={[styles.legendItem, { color: s.color === "#d0d7de" ? "#59636e" : s.color }]}>
            {s.label} ({s.value})
          </Text>
        ))}
      </View>
    </View>
  );
}

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", marginTop: 2 }}>
      {label ? <Text style={{ width: 110, color: "#59636e" }}>{label}</Text> : null}
      <Text style={{ flex: 1 }}>{children}</Text>
    </View>
  );
}

const LOG_LIMIT = 200;

// Bound the PDF: a large scan can produce hundreds of findings and thousands of
// instances, which makes react-pdf's synchronous layout spin for minutes (and
// blocks the event loop, so even a render timeout can't fire). Render only the
// most-severe findings (and a few instances each); the full list is on-screen.
const MAX_REPORT_FINDINGS = 50;
const MAX_INSTANCES_PER_FINDING = 5;

export function AccessibilityReportDocument({
  report,
  logo,
  strings,
}: {
  report: ReportData;
  logo: Buffer | null;
  strings: ReportStrings;
}) {
  const { t, tAcr, tBeta, locale } = strings;
  const counts = severityCounts(report.findings);
  const bandColor = outcomeColor(report.outcome);
  const renderedFindings = topIssues(report.findings, MAX_REPORT_FINDINGS);
  const grouped = groupFindingsBySeverity(renderedFindings);
  const top = topIssues(report.findings, 5);
  const affected = affectedSuccessCriteria(report.findings);
  const conformance = report.comparison?.conformance;
  const comparison = report.comparison;
  const totalFindings = report.findings.length;
  const truncatedFindings = totalFindings - renderedFindings.length;

  const methodRows = conformance?.rows ?? [];
  const machine = machineResults(methodRows);
  const aiRes = aiResults(comparison?.ai?.verdicts ?? []);
  const notTested = notTestedRows(methodRows);

  const reviewed = report.reviewStatus === "reviewed";
  const reviewResults = report.reviewResults ?? {};
  const claim = report.conformanceClaim;
  const identity = acrIdentity(report.reviewClaim, reviewed);
  const productName = hostOf(report.url);
  // The top-line result: an unreviewed (automated/AI-only) report is always a
  // "partial result", never a full conformance outcome — consistent on-screen.
  const reportOutcome = reviewed ? outcomeLabel(report.outcome, locale) : t("partialResult");
  const reportOutcomeColor = reviewed ? bandColor : outcomeColor("undetermined");
  const auditVersion = comparison?.audit?.auditVersion;
  const resolvedNotTested = notTested.rows.filter((r) => reviewResults[r.num]);


  const pages = report.pages ?? [];
  const sitemapUrls = report.sitemapUrls ?? [];
  const findingsByPage = new Map<string, typeof report.findings>();
  for (const f of report.findings) {
    const list = findingsByPage.get(f.pageUrl) ?? [];
    list.push(f);
    findingsByPage.set(f.pageUrl, list);
  }

  const toc = [
    { href: "#executive-summary", label: t("sectionExecSummary") },
    { href: "#methodology", label: t("sectionMethodology") },
    { href: "#conformance", label: t("sectionConformance") },
    { href: "#methods", label: t("sectionMethods") },
    { href: "#severity", label: t("sectionSeverity") },
    { href: "#pages", label: t("sectionPages") },
    { href: "#findings", label: t("sectionFindings") },
    { href: "#recommendations", label: t("sectionRecommendations") },
    ...(comparison ? [{ href: "#comparison", label: t("sectionComparison") }] : []),
    ...(reviewed ? [{ href: "#review", label: t("conformanceClaimHeading") }] : []),
    { href: "#glossary", label: t("glossaryHeading") },
    { href: "#limitations", label: t("limitationsHeading") },
    { href: "#log", label: t("scanLog") },
    ...(conformance?.rows?.length ? [{ href: "#acr", label: tAcr("title") }] : []),
  ];

  const summaryText = buildReportSummary(
    report as unknown as Parameters<typeof buildReportSummary>[0],
    locale,
  );

  return (
    <Document title={`${t("coverTitle")} — ${report.url}`}>
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          {logo ? <Image src={logo} style={styles.logo} /> : <Text style={styles.org}>{BRANDING.name}</Text>}
          <Text style={styles.org}>{BRANDING.name}</Text>
          <Text style={styles.sub}>{BRANDING.tagline}</Text>
          <Text style={styles.coverTitle}>{t("coverTitle")}</Text>
          <View style={styles.coverMeta}>
            <Row label={t("coverUrl")}>{report.url}</Row>
            <Row label={t("coverStandard")}>{report.standard}</Row>
            <Row label={t("coverPagesScanned")}>{String(report.pagesScanned)}</Row>
            {report.detectedLanguages && report.detectedLanguages.length > 0 && (
              <Row label={t("detectedLanguages")}>{report.detectedLanguages.join(" · ")}</Row>
            )}
            <Row label={t("coverGenerated")}>{generatedDate(report.generatedAt)}</Row>
          </View>
          <Text style={[styles.verdict, { color: reportOutcomeColor }]}>
            {reportOutcome} — {t("scsMeet", { met: report.scsMet, applicable: report.scsApplicable })}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 9, fontWeight: 700, color: "#8a3b00" }}>{tBeta("badge")}</Text>
          <Text style={styles.disclaimer}>{t("coverDisclaimer")}</Text>
        </View>
      </Page>

      {/* Table of contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{t("tocHeading")}</Text>
        {toc.map((entry) => (
          <Link key={entry.href} src={entry.href} style={styles.tocItem}>
            <Text style={{ color: "#0969da", fontSize: 12, marginBottom: 8 }}>{entry.label}</Text>
          </Link>
        ))}
        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
      </Page>

      {/* Main content */}
      <Page size="A4" style={styles.page} wrap>
        <View id="executive-summary" style={styles.section}>
          <Text style={styles.h2}>{t("sectionExecSummary")}</Text>
          <Text>{summaryText}</Text>
          <Text style={{ marginTop: 4 }}>
            {t("summaryResult")}: <Text style={{ color: reportOutcomeColor, fontWeight: 700 }}>{reportOutcome}</Text> — {t("scsMeet", { met: report.scsMet, applicable: report.scsApplicable })}, {t("pagesScannedLine", { count: report.pagesScanned })}.
          </Text>
          <Text style={{ marginTop: 4 }}>
            {t("summaryFindingCounts", {
              count: totalFindings,
              critical: counts.critical,
              serious: counts.serious,
              moderate: counts.moderate,
              minor: counts.minor,
            })}
          </Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            {t("validAsAt", { date: generatedDate(report.snapshotAt ?? report.generatedAt) })} ·{" "}
            {reviewed ? t("retestReviewed", { date: generatedDate(report.reviewedAt ?? claim?.signedAt) }) : t("retestPending")}
          </Text>
          {top.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.h3}>{t("topIssuesHeading")}</Text>
              {top.map((f, i) => (
                <Text key={i} style={{ marginTop: 2 }}>
                  <Text style={{ color: severityColor(f.impact), fontWeight: 700 }}>{impactLabel(f.impact, locale)}</Text> — {f.description}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>{t("noViolations")}</Text>
          )}
        </View>

        <View id="methodology" style={styles.section}>
          <Text style={styles.h2}>{t("sectionMethodology")}</Text>
          <Text>{t("engineLine")}</Text>
          {auditVersion ? (
            <Text style={{ marginTop: 4 }}>{t("engineVersionLine", { version: auditVersion })}</Text>
          ) : null}
          <Text style={{ marginTop: 4 }}>{t("renderedLine")}</Text>
          <Text style={{ marginTop: 4 }}>{t("environmentLine")}</Text>
          <Text style={{ marginTop: 4 }}>{t("noAssistiveTechLine")}</Text>
          <Text style={{ marginTop: 4 }}>{t("findingsChainLine")}</Text>
          <Text style={{ marginTop: 4 }}>{t("reproducibleLine")}</Text>
          <Text style={{ marginTop: 4 }}>
            {t("preliminaryNote")}
          </Text>
          <Text style={styles.h3}>{t("samplingHeading")}</Text>
          <Text>{t("samplingBody")}</Text>
        </View>

        <View id="conformance" style={styles.section}>
          <Text style={styles.h2}>{t("sectionConformance")}</Text>
          {conformance ? (
            <View>
              <Text>
                {t("conformanceSummary", {
                  passed: conformance.passed,
                  failed: conformance.failed,
                  notPresent: conformance.notPresent,
                  notTested: conformance.notTested,
                  coverage: conformance.coverage,
                  level: conformance.levelAttained,
                })}
              </Text>
              <Text style={[styles.muted, { marginTop: 4 }]}>{t("conformanceNotScore")}</Text>
              <View style={{ marginTop: 8 }}>
                <ConformanceBar c={conformance} />
              </View>

              {conformance.rows.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.h3}>{t("conformanceHeading")}</Text>
                  <Text style={styles.muted}>{t("testedByNote")}</Text>
                  <View style={{ marginTop: 6 }}>
                    {groupConformanceRows(conformance.rows).map(([principle, rows]) => (
                      <View key={principle} style={{ marginTop: 8 }}>
                        <Text style={styles.h3}>
                          {t("principleLabel", { principle })} — {principleName(Number(principle), locale)} ({rows.length})
                        </Text>
                        <View style={styles.tableRow}>
                          <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thSc")}</Text>
                          <Text style={[styles.tableCell, styles.tableHead, { flex: 1.8 }]}>{t("thTitle")}</Text>
                          <Text style={[styles.tableCell, styles.tableHead, { flex: 0.5 }]}>{t("thLevel")}</Text>
                          <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thResult")}</Text>
                          <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thTestedBy")}</Text>
                        </View>
                        {rows.map((row) => {
                          const tested = testedByOf(row);
                          return (
                            <View key={row.num} style={styles.tableRow}>
                              <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.num}</Text>
                              <Text style={[styles.tableCell, { flex: 1.8 }]}>{scTitle(row.num, locale)}</Text>
                              <Text style={[styles.tableCell, { flex: 0.5 }]}>{row.level}</Text>
                              <Text style={[styles.tableCell, { flex: 1 }]}>{verdictLabel(row.result, locale)}</Text>
                              <Text style={[styles.tableCell, { flex: 1 }]}>{testedByLabel(tested, row.confidence, t)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {affected.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.h3}>{t("affectedScHeading")}</Text>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thSc")}</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>{t("thTitle")}</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thResult")}</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 0.6 }]}>{t("thElements")}</Text>
                  </View>
                  {affected.map((r) => (
                    <View key={r.sc} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{r.sc}</Text>
                      <Text style={[styles.tableCell, { flex: 1.6 }]}>{scTitle(r.sc, locale)}</Text>
                      <Text style={[styles.tableCell, { flex: 1, color: severityColor(r.severity) }]}>{impactLabel(r.severity, locale)}</Text>
                      <Text style={[styles.tableCell, { flex: 0.6 }]}>{String(r.elements)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.empty}>{t("noConformanceData")}</Text>
          )}
        </View>

        {methodRows.length > 0 ? (
          <View id="methods" style={styles.section}>
            <Text style={styles.h2}>{t("sectionMethods")}</Text>
            <Text style={styles.muted}>{t("methodsIntro")}</Text>

            <Text style={styles.h3}>{t("machineTitle")} — {t("machineSummary", { passed: machine.passed, failed: machine.failed })}</Text>
            {machine.rows.length === 0 ? (
              <Text style={styles.empty}>{t("machineEmpty")}</Text>
            ) : (
              <View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thSc")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.8 }]}>{t("thTitle")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.6 }]}>{t("thLevel")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thResult")}</Text>
                </View>
                {machine.rows.map((row) => (
                  <View key={row.num} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.num}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8 }]}>{scTitle(row.num, locale)}</Text>
                    <Text style={[styles.tableCell, { flex: 0.6 }]}>{row.level}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{verdictLabel(row.machineResult ?? "", locale)}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.h3}>{t("aiTitle")} — {t("aiSummary", { passed: aiRes.passed, failed: aiRes.failed, notTested: aiRes.notTested })}</Text>
            {aiRes.verdicts.length === 0 ? (
              <Text style={styles.empty}>{t("aiEmpty")}</Text>
            ) : (
              <View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thSc")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thVerdict")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thConfidence")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>{t("thReasoning")}</Text>
                </View>
                {aiRes.verdicts.map((v) => (
                  <View key={v.sc} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{v.sc}</Text>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{verdictLabel(v.verdict, locale)}</Text>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{Math.round(v.confidence * 100)}%</Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{v.reasoning}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.muted, { marginTop: 2 }]}>{t("aiAssistedNote")}</Text>

            <Text style={styles.h3}>{t("notTestedTitle")} — {t("notTestedSummary", { count: notTested.count })}</Text>
            {notTested.rows.length === 0 ? (
              <Text style={styles.empty}>{t("notTestedEmpty")}</Text>
            ) : (
              <View>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thSc")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.8 }]}>{t("thTitle")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.4 }]}>{t("notTestedReason")}</Text>
                </View>
                {notTested.rows.map((row) => (
                  <View key={row.num} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.num}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8 }]}>{scTitle(row.num, locale)}</Text>
                    <Text style={[styles.tableCell, { flex: 1.4 }]}>
                      {t("notTestedReasonBody")}{" "}
                      {getManualTest(row.num, locale)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {reviewed ? (
          <View id="review" style={styles.section}>
            <Text style={styles.h2}>{t("conformanceClaimHeading")}</Text>
            {claim ? (
              <View>
                <Text>
                  {t("conformanceClaimOutcome", {
                    outcome: outcomeLabel(claim.outcome, locale),
                    met: claim.scsMet,
                    applicable: claim.scsApplicable,
                  })}
                </Text>
                <Row label={t("reviewerLabel")}>{[claim.reviewer, claim.organization].filter(Boolean).join(" — ")}</Row>
                <Row label={t("asAtLabel")}>{generatedDate(claim.asAt)}</Row>
                <Row label={t("signedAtLabel")}>{generatedDate(claim.signedAt)}</Row>
              </View>
            ) : null}
            {resolvedNotTested.length > 0 ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.h3}>{t("reviewedResultsHeading")}</Text>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{t("thSc")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>{t("thTitle")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("reviewedVerdict")}</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.8 }]}>{t("reviewedNote")}</Text>
                </View>
                {resolvedNotTested.map((row) => {
                  const r = reviewResults[row.num];
                  return (
                    <View key={row.num} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.num}</Text>
                      <Text style={[styles.tableCell, { flex: 1.6 }]}>{scTitle(row.num, locale)}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{verdictLabel(r?.verdict ?? "Passed", locale)}</Text>
                      <Text style={[styles.tableCell, { flex: 1.8 }]}>
                        {r?.note ? `${r.note} · ${r.reviewedBy}` : (r?.reviewedBy ?? "")}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        <View id="severity" style={styles.section}>
          <Text style={styles.h2}>{t("sectionSeverity")}</Text>
          <SeverityBars counts={counts} locale={locale} />
          <Text style={styles.h3}>{t("severityLegendHeading")}</Text>
          {SEVERITY_ORDER.map((sev) => (
            <Text key={sev} style={{ marginTop: 2 }}>
              <Text style={{ color: severityColor(sev), fontWeight: 700 }}>{impactLabel(sev, locale)}</Text>
              {" — "}
              {t(`severity_${sev}`)}
            </Text>
          ))}
          <Text style={[styles.muted, { marginTop: 4 }]}>{t("severityPrioritizationNote")}</Text>
        </View>

        <View id="pages" style={styles.section}>
          <Text style={styles.h2}>{t("sectionPages")}</Text>
          <Text style={styles.muted}>{t("pagesIntro")}</Text>
          <View style={{ marginTop: 6 }}>
            {sitemapUrls.length > 0 ? (
              <Text>{t("pagesSitemapFound", { count: sitemapUrls.length })}</Text>
            ) : (
              <Text>{t("pagesNoSitemap")}</Text>
            )}
            {sitemapUrls.length > 0 && (
              <View style={{ marginTop: 4 }}>
                {sitemapUrls.map((u) => (
                  <Text key={u} style={styles.muted}>• {u}</Text>
                ))}
              </View>
            )}
          </View>

          {pages.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>{t("pagesThTitle")}</Text>
                <Text style={[styles.tableCell, styles.tableHead, { flex: 2 }]}>{t("pagesThUrl")}</Text>
                <Text style={[styles.tableCell, styles.tableHead, { flex: 0.6 }]}>{t("pagesThTime")}</Text>
                <Text style={[styles.tableCell, styles.tableHead, { flex: 0.7 }]}>{t("pagesThStatus")}</Text>
                <Text style={[styles.tableCell, styles.tableHead, { flex: 1.2 }]}>{t("pagesThFindings")}</Text>
              </View>
              {pages.map((page) => {
                const pageFindings = findingsByPage.get(page.url) ?? [];
                const pc = severityCounts(pageFindings);
                return (
                  <View key={page.url} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{page.title || page.url}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{page.url}</Text>
                    <Text style={[styles.tableCell, { flex: 0.6 }]}>{(page.scanTimeMs / 1000).toFixed(1)}s</Text>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{t(PAGE_STATUS_KEY[page.status] ?? "pageStatusScanned")}</Text>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>
                      {pageFindings.length === 0
                        ? t("pagesNoFindings")
                        : t("pagesFindingsSummary", {
                            critical: pc.critical,
                            serious: pc.serious,
                            moderate: pc.moderate,
                            minor: pc.minor,
                          })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View id="findings" style={styles.section}>
          <Text style={styles.h2}>{t("sectionFindings")}</Text>
          {truncatedFindings > 0 ? (
            <Text style={styles.muted}>{t("findingsTruncated", { shown: renderedFindings.length, total: totalFindings })}</Text>
          ) : null}
          {totalFindings === 0 ? (
            <Text style={styles.empty}>{t("noViolations")}</Text>
          ) : (
            grouped.map((g) => (
              <View key={g.severity} style={{ marginTop: 8 }}>
                <Text style={[styles.h3, { color: severityColor(g.severity) }]}>
                  {impactLabel(g.severity, locale)} ({g.items.length})
                </Text>
                {g.items.map((f, i) => (
                  <FindingBlock key={i} finding={f} locale={locale} strings={strings} report={report} />
                ))}
              </View>
            ))
          )}
        </View>

        <View id="recommendations" style={styles.section}>
          <Text style={styles.h2}>{t("sectionRecommendations")}</Text>
          {totalFindings === 0 ? (
            <Text style={styles.empty}>{t("noRemediation")}</Text>
          ) : (
            renderedFindings.map((f, i) => (
                <Text key={i} style={{ marginTop: 3 }}>
                  <Text style={{ fontWeight: 700 }}>{(f.wcagSc ?? []).join(" ") || f.ruleId}</Text> — {f.recommendation} <Text style={styles.muted}>({f.pageUrl})</Text>
                </Text>
              ))
          )}
        </View>

        {comparison ? (
          <View id="comparison" style={styles.section}>
            <Text style={styles.h2}>{t("sectionComparison")}</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thSignal")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>{t("thResult")}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{t("conformance")}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{outcomeLabel(comparison.conformance?.outcome, locale)}</Text>
            </View>
            {typeof comparison.audit?.score === "number" ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{t("siteAuditA11y")}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{comparison.audit.score} / 100</Text>
              </View>
            ) : null}
            {(["performance", "seo", "bestPractices", "pwa"] as const).map((key) =>
              typeof comparison.audit?.signals?.[key] === "number" ? (
                <View key={key} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{t(SIGNAL_KEY[key]!)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{comparison.audit!.signals![key]! / 1} / 100</Text>
                </View>
              ) : null,
            )}
            <Text style={[styles.muted, { marginTop: 4 }]}>{t("preliminaryNote")}</Text>
          </View>
        ) : null}

        <View id="glossary" style={styles.section}>
          <Text style={styles.h2}>{t("glossaryHeading")}</Text>
          <Text>{t("glossaryPassed")}</Text>
          <Text>{t("glossaryFailed")}</Text>
          <Text>{t("glossaryNotTested")}</Text>
          <Text>{t("glossaryNotPresent")}</Text>
        </View>

        <View id="limitations" style={styles.section}>
          <Text style={styles.h2}>{t("limitationsHeading")}</Text>
          <Text>{t("limitationsBody")}</Text>
        </View>

        {report.log && report.log.length > 0 ? (
          <View id="log" style={styles.section}>
            <Text style={styles.h2}>{t("scanLog")}</Text>
            <Text style={styles.muted}>{t("logTruncated", { count: LOG_LIMIT })}</Text>
            {report.log.slice(-LOG_LIMIT).map((entry, i) => (
              <Text key={`${entry.timestamp}-${i}`} style={{ marginTop: 1, fontSize: 8, fontFamily: "Courier" }}>
                [{entry.timestamp.slice(11, 19)}] {entry.message}
              </Text>
            ))}
          </View>
        ) : null}

        {conformance?.rows?.length ? (
          <View id="acr" style={styles.section}>
            <Text style={styles.h2}>{tAcr("title")}</Text>
            {reviewed && claim ? (
              <Text style={{ color: "#1a7f37", fontWeight: 700 }}>
                {tAcr("signedBanner", { evaluator: [claim.reviewer, claim.organization].filter(Boolean).join(" — ") })}
              </Text>
            ) : (
              <Text style={{ color: "#8a3b00", fontWeight: 700 }}>{tAcr("draft")}</Text>
            )}

            <Text style={styles.h3}>{tAcr("summaryHeading")}</Text>
            <Row label={tAcr("productUrl")}>{report.url}</Row>
            <Row label={tAcr("productName")}>{productName}</Row>
            <Row label={tAcr("productVersion")}>{tAcr("websiteVersion", { date: generatedDate(report.snapshotAt ?? report.generatedAt) })}</Row>
            <Row label={tAcr("standard")}>{report.standard}</Row>
            <Row label={tAcr("reportDate")}>{generatedDate(report.generatedAt)}</Row>
            <Row label={tAcr("evaluator")}>
              {identity.reviewerName
                ? [identity.reviewerName, identity.organization].filter(Boolean).join(" — ")
                : tAcr("automatedEvaluator")}
            </Row>
            <Row label={tAcr("contact")}>{identity.email || BRANDING.email}</Row>
            <Row label={tAcr("coverage")}>
              {tAcr("coverageBody", {
                resolved: conformance.passed + conformance.failed,
                total: conformance.total,
                notTested: conformance.notTested,
              })}
            </Row>
            <Row label={tAcr("evaluationMethod")}>
              {(report.reviewClaim?.evaluationMethods ?? [
                tAcr("evaluationMethodBody"),
                tAcr("noAssistiveTech"),
              ]).join(" · ")}
            </Row>
            {report.partial ? (
              <Row label={tAcr("notes")}>{tAcr("crawlLimitNote")}</Row>
            ) : null}

            {reviewed && claim ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.h3}>{tAcr("conformanceClaim")}</Text>
                <Row label={tAcr("reviewer")}>{[claim.reviewer, claim.organization].filter(Boolean).join(" — ")}</Row>
                <Row label={tAcr("signedAt")}>{generatedDate(claim.signedAt)}</Row>
                <Row label={tAcr("asAt")}>{generatedDate(claim.asAt)}</Row>
              </View>
            ) : null}

            <Text style={styles.h3}>{tAcr("resultsHeading")}</Text>
            <Text style={styles.muted}>{tAcr("conformanceNote")}</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>{tAcr("thSc")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>{tAcr("thCriterion")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 0.6 }]}>{tAcr("thLevel")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1.1 }]}>{tAcr("thConformance")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1.8 }]}>{tAcr("thRemarks")}</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 0.9 }]}>{tAcr("thTestedBy")}</Text>
            </View>
            {conformance.rows.map((row) => {
              const reviewResult = reviewResults[row.num];
              const remarks = acrRemarks({
                num: row.num,
                result: row.result,
                findings: report.findings,
                reviewResult,
                t: tAcr,
              });
              return (
                <View key={row.num} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{row.num}</Text>
                  <Text style={[styles.tableCell, { flex: 1.6 }]}>{scTitle(row.num, locale)}</Text>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>{row.level}</Text>
                  <Text style={[styles.tableCell, { flex: 1.1 }]}>{tAcr(vpatLabelKey(vpatLevelOf(row, reviewResult)))}</Text>
                  <Text style={[styles.tableCell, { flex: 1.8 }]}>{remarks}</Text>
                  <Text style={[styles.tableCell, { flex: 0.9 }]}>
                    {tAcr(TESTED_BY_KEY[testedByOf(row)])}
                    {row.confidence === "single-source" ? ` · ${t("confidenceSingleSource")}` : ""}
                  </Text>
                </View>
              );
            })}
            <Text style={[styles.muted, { marginTop: 4 }]}>{tAcr("generatedBy")}</Text>
          </View>
        ) : null}

        <View style={styles.colophon}>
          <View>
            <Text>{BRANDING.legalName}</Text>
            <Text>{BRANDING.charity}</Text>
            {BRANDING.address.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text>{BRANDING.website}</Text>
            <Text>{BRANDING.email}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
      </Page>
    </Document>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function groupConformanceRows(
  rows: NonNullable<NonNullable<ReportData["comparison"]>["conformance"]>["rows"],
): [string, typeof rows][] {
  const map = new Map<string, typeof rows>();
  for (const row of rows) {
    const principle = row.num.split(".")[0] ?? "?";
    const list = map.get(principle) ?? [];
    list.push(row);
    map.set(principle, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
}

function testedByLabel(
  tested: TestedBy,
  confidence: string | undefined,
  t: ReportStrings["t"],
): string {
  let base: string;
  if (tested === "machine") base = t("machine");
  else if (tested === "ai") base = t("ai");
  else if (tested === "human") base = t("needsHuman");
  else if (tested === "notTested") base = t("notTested");
  else base = "—";
  if (confidence === "single-source") base += ` · ${t("confidenceSingleSource")}`;
  return base;
}

function FindingBlock({
  finding,
  locale,
  strings,
  report,
}: {
  finding: ReportData["findings"][number];
  locale: string;
  strings: ReportStrings;
  report: ReportData;
}) {
  const { t } = strings;
  const sc = finding.wcagSc?.[0];
  const allInstances = finding.instances ?? [];
  const instances = allInstances.slice(0, MAX_INSTANCES_PER_FINDING);
  const hiddenInstances = allInstances.length - instances.length;
  return (
    <View style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 6 }}>
      <Text>
        <Text style={{ color: severityColor(finding.impact), fontWeight: 700 }}>
          {impactLabel(finding.impact, locale)}
        </Text>
        {sc ? ` · WCAG ${sc} · ${scTitle(sc, locale)} (${t("levelLabel", { level: finding.wcagLevel ?? "" })})` : ` · ${t("bestPractice")}`}
      </Text>
      <Text style={{ marginTop: 2 }}>{finding.description}</Text>
      <Text style={styles.muted}>{finding.pageUrl}</Text>
      {finding.sources && finding.sources.length > 0 ? (
        <Text style={[styles.muted, { marginTop: 2 }]}>
          {t("detectedBy")} {[...new Set(finding.sources.map((s) => s.tool))].map((x) => x.toUpperCase()).join(", ")}
        </Text>
      ) : null}
      {finding.confidence ? (
        <Text style={[styles.muted, { marginTop: 2 }]}>
          {t("confidenceLabel")}:{" "}
          {finding.confidence === "confirmed" ? t("confidenceConfirmed") : t("confidenceSingleSource")}
        </Text>
      ) : null}
      {instances.map((instance, i) => {
        const img = instance.evidenceId ? report.evidenceImages?.[instance.evidenceId] : undefined;
        return (
          <View key={i} style={{ marginTop: 4 }}>
            {instance.target ? <Text style={styles.codeBlock}>{instance.target}</Text> : null}
            {instance.html ? <Text style={styles.codeBlock}>{instance.html}</Text> : null}
            {sc ? (
              <Text style={{ marginTop: 2 }}>
                <Text style={{ fontWeight: 700 }}>{t("expected")}: </Text>
                {scTitle(sc, locale)} {t("expectedSatisfied")}
              </Text>
            ) : null}
            {instance.failureSummary ? (
              <Text style={{ marginTop: 2, color: "#8a3b00" }}>
                <Text style={{ fontWeight: 700 }}>{t("observed")}: </Text>
                {instance.failureSummary}
              </Text>
            ) : null}
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {img ? <Image src={img.dataUri} style={styles.evidenceImage} /> : null}
          </View>
        );
      })}
      {hiddenInstances > 0 ? (
        <Text style={styles.muted}>{t("instancesTruncated", { count: hiddenInstances })}</Text>
      ) : null}
      <Text style={{ marginTop: 4 }}>
        <Text style={{ color: "#8a3b00" }}>{t("fixLabel")} </Text>
        {finding.recommendation}
      </Text>
      {finding.help || finding.helpUrl ? (
        <Text style={[styles.muted, { marginTop: 2 }]}>
          {t("learnLabel")}:{" "}
          {finding.helpUrl ? (
            <Link src={finding.helpUrl} style={{ color: "#0969da" }}>
              {finding.help || finding.helpUrl}
            </Link>
          ) : (
            finding.help
          )}
        </Text>
      ) : null}
    </View>
  );
}

export async function renderReportDocument(
  report: ReportData,
  logo: Buffer | null,
  strings: ReportStrings,
): Promise<Buffer> {
  return renderToBuffer(<AccessibilityReportDocument report={report} logo={logo} strings={strings} />);
}
