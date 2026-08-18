import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Path,
  Link,
  renderToBuffer,
} from "@react-pdf/renderer";
import { BRANDING } from "@/lib/branding";
import {
  affectedSuccessCriteria,
  generatedDate,
  groupFindingsBySeverity,
  passBandColor,
  severityColor,
  severityCounts,
  severityRank,
  topIssues,
  SEVERITY_ORDER,
  type SeverityCounts,
} from "./report-data";
import type { ReportData } from "./types";

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
  coverMetaRow: { fontSize: 11, marginTop: 2 },
  gauge: { marginTop: 28 },
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
});

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 80;
  const arcLength = Math.PI * radius;
  const dash = arcLength * (clamped / 100);
  const d = "M 20 110 A 80 80 0 0 1 180 110";

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={240} height={120} viewBox="0 0 200 120">
        <Path d={d} stroke="#e5e7eb" strokeWidth={16} fill="none" strokeLinecap="round" />
        <Path
          d={d}
          stroke={color}
          strokeWidth={16}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(1)} ${arcLength.toFixed(1)}`}
        />
      </Svg>
      <Text style={{ fontSize: 28, fontWeight: 700, color }}>{clamped}</Text>
      <Text style={{ fontSize: 10, color: "#59636e" }}>out of 100</Text>
    </View>
  );
}

function SeverityBars({ counts }: { counts: SeverityCounts }) {
  const max = Math.max(1, ...SEVERITY_ORDER.map((s) => counts[s]));

  return (
    <View>
      {SEVERITY_ORDER.map((sev) => {
        const count = counts[sev];
        const pct = count === 0 ? 0 : Math.max(3, (count / max) * 100);
        const color = severityColor(sev);
        return (
          <View key={sev} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ width: 70, fontSize: 9 }}>{sev}</Text>
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

function ConformanceBar({ c }: { c: { compliant: number; violate: number; notApplicable: number; needHumanChecking: number } }) {
  const total = c.compliant + c.violate + c.notApplicable + c.needHumanChecking;
  if (total <= 0) return <Text style={styles.empty}>No conformance data.</Text>;

  const segments = [
    { label: "Compliant", value: c.compliant, color: "#1a7f37" },
    { label: "Violation", value: c.violate, color: "#d1242f" },
    { label: "Not applicable", value: c.notApplicable, color: "#d0d7de" },
    { label: "Needs human check", value: c.needHumanChecking, color: "#9a6700" },
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
      <Text>{children}</Text>
    </View>
  );
}

export function AccessibilityReportDocument({ report, logo }: { report: ReportData; logo: Buffer | null }) {
  const counts = severityCounts(report.findings);
  const bandColor = passBandColor(report.passBand);
  const grouped = groupFindingsBySeverity(report.findings);
  const top = topIssues(report.findings, 5);
  const affected = affectedSuccessCriteria(report.findings);
  const conformance = report.comparison?.conformance;
  const comparison = report.comparison;
  const totalFindings = report.findings.length;

  const toc = [
    { href: "#executive-summary", label: "1. Executive summary" },
    { href: "#methodology", label: "2. Methodology" },
    { href: "#conformance", label: "3. WCAG conformance" },
    { href: "#severity", label: "4. Severity distribution" },
    { href: "#findings", label: "5. Findings" },
    { href: "#recommendations", label: "6. Remediation recommendations" },
    ...(comparison ? [{ href: "#comparison", label: "7. Cross-tool comparison" }] : []),
  ];

  return (
    <Document title={`Accessibility Assessment — ${report.url}`}>
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          {logo ? <Image src={logo} style={styles.logo} /> : <Text style={styles.org}>{BRANDING.name}</Text>}
          <Text style={styles.org}>{BRANDING.name}</Text>
          <Text style={styles.sub}>{BRANDING.tagline}</Text>
          <Text style={styles.coverTitle}>Web Accessibility Assessment Report</Text>
          <View style={styles.coverMeta}>
            <Row label="URL">{report.url}</Row>
            <Row label="Standard">{report.standard}</Row>
            <Row label="Pages scanned">{String(report.pagesScanned)}</Row>
            <Row label="Generated">{generatedDate(report.generatedAt)}</Row>
          </View>
          <View style={styles.gauge}>
            <ScoreGauge score={report.score} color={bandColor} />
          </View>
          <Text style={[styles.verdict, { color: bandColor }]}>Result: {report.passBand}</Text>
          <Text style={styles.disclaimer}>
            Automated assessment — findings are preliminary and do not constitute a full WCAG conformance claim.
          </Text>
        </View>
      </Page>

      {/* Table of contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Table of contents</Text>
        {toc.map((t) => (
          <Link key={t.href} src={t.href} style={styles.tocItem}>
            <Text style={{ color: "#0969da", fontSize: 12, marginBottom: 8 }}>{t.label}</Text>
          </Link>
        ))}
        <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
      </Page>

      {/* Main content */}
      <Page size="A4" style={styles.page} wrap>
        <View id="executive-summary" style={styles.section}>
          <Text style={styles.h2}>1. Executive summary</Text>
          <Text>
            Result: <Text style={{ color: bandColor, fontWeight: 700 }}>{report.passBand}</Text> — score {report.score} / 100 across {report.pagesScanned} page(s).
          </Text>
          <Text style={{ marginTop: 4 }}>
            {totalFindings} finding(s): critical {counts.critical}, serious {counts.serious}, moderate {counts.moderate}, minor {counts.minor}.
          </Text>
          {top.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.h3}>Top issues</Text>
              {top.map((f, i) => (
                <Text key={i} style={{ marginTop: 2 }}>
                  <Text style={{ color: severityColor(f.impact), fontWeight: 700 }}>{f.impact}</Text> — {f.description}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>No automated findings detected.</Text>
          )}
        </View>

        <View id="methodology" style={styles.section}>
          <Text style={styles.h2}>2. Methodology</Text>
          <Text>
            Automated testing by the Ascent Access accessibility engine, with a companion site audit and AI-assisted review.
          </Text>
          <Text style={{ marginTop: 4 }}>
            This is an automated baseline. Automated tools detect a subset of WCAG issues; full conformance requires manual review (keyboard operation, screen readers, and contrast inspection).
          </Text>
        </View>

        <View id="conformance" style={styles.section}>
          <Text style={styles.h2}>3. WCAG conformance</Text>
          {conformance ? (
            <View>
              <Text>
                {conformance.compliant} compliant · {conformance.violate} violation · {conformance.notApplicable} not applicable · {conformance.needHumanChecking} need human check · {conformance.coverage}% tested · level attained: <Text style={{ fontWeight: 700 }}>{conformance.levelAttained}</Text>
              </Text>
              <View style={{ marginTop: 8 }}>
                <ConformanceBar c={conformance} />
              </View>
              {affected.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.h3}>Affected success criteria</Text>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>WCAG SC</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>Title</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>Severity</Text>
                    <Text style={[styles.tableCell, styles.tableHead, { flex: 0.6 }]}>Elements</Text>
                  </View>
                  {affected.map((r) => (
                    <View key={r.sc} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{r.sc}</Text>
                      <Text style={[styles.tableCell, { flex: 1.6 }]}>{r.title}</Text>
                      <Text style={[styles.tableCell, { flex: 1, color: severityColor(r.severity) }]}>{r.severity}</Text>
                      <Text style={[styles.tableCell, { flex: 0.6 }]}>{String(r.elements)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.empty}>No conformance data available.</Text>
          )}
        </View>

        <View id="severity" style={styles.section}>
          <Text style={styles.h2}>4. Severity distribution</Text>
          <SeverityBars counts={counts} />
        </View>

        <View id="findings" style={styles.section}>
          <Text style={styles.h2}>5. Findings</Text>
          {totalFindings === 0 ? (
            <Text style={styles.empty}>No automated findings detected.</Text>
          ) : (
            grouped.map((g) => (
              <View key={g.severity} style={{ marginTop: 8 }}>
                <Text style={[styles.h3, { color: severityColor(g.severity) }]}>
                  {g.severity.charAt(0).toUpperCase() + g.severity.slice(1)} ({g.items.length})
                </Text>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.2 }]}>Rule</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 0.8 }]}>WCAG SC</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.2 }]}>Page</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>Description</Text>
                  <Text style={[styles.tableCell, styles.tableHead, { flex: 1.6 }]}>Recommendation</Text>
                </View>
                {g.items.map((f, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>{f.ruleId}</Text>
                    <Text style={[styles.tableCell, { flex: 0.8 }]}>{(f.wcagSc ?? []).join(" ")}</Text>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>{f.pageUrl}</Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{f.description}</Text>
                    <Text style={[styles.tableCell, { flex: 1.6 }]}>{f.recommendation}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>

        <View id="recommendations" style={styles.section}>
          <Text style={styles.h2}>6. Remediation recommendations</Text>
          {totalFindings === 0 ? (
            <Text style={styles.empty}>No remediation required by this scan.</Text>
          ) : (
            [...report.findings]
              .sort((a, b) => severityRank(a.impact) - severityRank(b.impact))
              .map((f, i) => (
                <Text key={i} style={{ marginTop: 3 }}>
                  <Text style={{ fontWeight: 700 }}>{(f.wcagSc ?? []).join(" ") || f.ruleId}</Text> — {f.recommendation} <Text style={styles.muted}>({f.pageUrl})</Text>
                </Text>
              ))
          )}
        </View>

        {comparison ? (
          <View id="comparison" style={styles.section}>
            <Text style={styles.h2}>7. Ascent Access analysis</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>Signal</Text>
              <Text style={[styles.tableCell, styles.tableHead, { flex: 1 }]}>Result</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>Accessibility score</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{report.score} / 100</Text>
            </View>
            {comparison.audit !== undefined ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>Site audit accessibility</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{comparison.audit.score} / 100</Text>
              </View>
            ) : null}
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

export async function renderReportDocument(report: ReportData, logo: Buffer | null): Promise<Buffer> {
  return renderToBuffer(<AccessibilityReportDocument report={report} logo={logo} />);
}
