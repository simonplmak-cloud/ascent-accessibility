import type { AssessmentResult } from "@/components/assessment/types";
import { scTitle } from "@/lib/standards/wcag-sc";

interface SummaryStrings {
  summary: (url: string, pages: number, findings: number) => string;
  fails: (count: number, listed: string, more: string) => string;
  more: (count: number) => string;
  notTested: (count: number) => string;
  none: string;
  partial: string;
  conforms: string;
  doesNotConform: string;
  undetermined: string;
  closing: string;
}

function en(): SummaryStrings {
  return {
    summary: (url, pages, findings) =>
      `Summary: ${url} was assessed across ${pages} ${pages === 1 ? "page" : "pages"} with ${findings} ${findings === 1 ? "finding" : "findings"}.`,
    fails: (count, listed, more) =>
      ` It fails ${count} success ${count === 1 ? "criterion" : "criteria"} — ${listed}${more}.`,
    more: (count) => `, and ${count} more`,
    notTested: (count) =>
      ` No criteria failed, but ${count} were not AI-tested and need review.`,
    none: " No success criteria failed.",
    partial: " This is a partial result — human review is required for a full conformance determination.",
    conforms: " It conforms to the selected standard.",
    doesNotConform: " It does not conform to the selected standard.",
    undetermined: " Conformance has not yet been determined.",
    closing: " See the findings below for what to fix.",
  };
}

function zhHans(): SummaryStrings {
  return {
    summary: (url, pages, findings) =>
      `摘要：已对 ${url} 评估了 ${pages} 个页面，共发现 ${findings} 项问题。`,
    fails: (count, listed, more) => ` 有 ${count} 项成功准则未通过 — ${listed}${more}。`,
    more: (count) => `，另有 ${count} 项`,
    notTested: (count) => ` 没有准则未通过，但有 ${count} 项未经过 AI 测试，需要审查。`,
    none: " 没有成功准则未通过。",
    partial: " 这是部分结果 — 需要人工审查才能完成完整的符合性判定。",
    conforms: " 符合所选标准。",
    doesNotConform: " 不符合所选标准。",
    undetermined: " 合规性尚未判定。",
    closing: " 请参阅下方的发现项目以了解修复方式。",
  };
}

function zhHant(): SummaryStrings {
  return {
    summary: (url, pages, findings) =>
      `摘要：已對 ${url} 評估了 ${pages} 個頁面，共發現 ${findings} 項問題。`,
    fails: (count, listed, more) => ` 有 ${count} 項成功準則未通過 — ${listed}${more}。`,
    more: (count) => `，另有 ${count} 項`,
    notTested: (count) => ` 沒有準則未通過，但有 ${count} 項未經過 AI 測試，需要審查。`,
    none: " 沒有成功準則未通過。",
    partial: " 這是部分結果 — 需要人工審查才能完成完整的符合性判定。",
    conforms: " 符合所選標準。",
    doesNotConform: " 不符合所選標準。",
    undetermined: " 合規性尚未判定。",
    closing: " 請參閱下方的發現項目以了解修復方式。",
  };
}

export function buildReportSummary(result: AssessmentResult, locale?: string): string {
  const s =
    locale === "zh-Hant" ? zhHant() : locale === "zh-Hans" ? zhHans() : en();
  const url = result.url ?? "This website";
  const pages = result.pagesScanned;
  const findingCount = result.findings.length;
  const conformance = result.comparison?.conformance;

  let conformancePart = "";
  if (conformance) {
    const fails = conformance.rows.filter((row) => row.result === "Failed");
    if (fails.length > 0) {
      const listed = fails
        .slice(0, 3)
        .map((row) => `${row.num} ${scTitle(row.num, locale)}`)
        .join("; ");
      const more = fails.length > 3 ? s.more(fails.length - 3) : "";
      conformancePart = s.fails(fails.length, listed, more);
    } else if (conformance.notTested > 0) {
      conformancePart = s.notTested(conformance.notTested);
    } else {
      conformancePart = s.none;
    }
  }

  const outcome = conformance?.outcome;
  const reviewed = result.reviewStatus === "reviewed";
  const outcomePart = !reviewed
    ? s.partial
    : outcome === "conforms"
      ? s.conforms
      : outcome === "does-not-conform"
        ? s.doesNotConform
        : s.undetermined;

  return s.summary(url, pages, findingCount) + conformancePart + outcomePart + s.closing;
}
