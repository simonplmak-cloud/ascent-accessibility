import type { AssessmentResult } from "@/components/assessment/types";
import { scTitle } from "@/lib/standards/wcag-sc";

interface SummaryStrings {
  summary: (url: string, pages: number, findings: number) => string;
  fails: (count: number, listed: string, more: string) => string;
  more: (count: number) => string;
  cannotTell: (count: number) => string;
  none: string;
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
    cannotTell: (count) =>
      ` No criteria failed, but ${count} cannot be determined and need human review.`,
    none: " No success criteria failed.",
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
    cannotTell: (count) => ` 没有准则未通过，但有 ${count} 项无法判定，需要人工审核。`,
    none: " 没有成功准则未通过。",
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
    cannotTell: (count) => ` 沒有準則未通過，但有 ${count} 項無法判定，需要人工審核。`,
    none: " 沒有成功準則未通過。",
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
    } else if (conformance.cannotTell > 0) {
      conformancePart = s.cannotTell(conformance.cannotTell);
    } else {
      conformancePart = s.none;
    }
  }

  const outcome = conformance?.outcome;
  const outcomePart =
    outcome === "conforms"
      ? s.conforms
      : outcome === "does-not-conform"
        ? s.doesNotConform
        : s.undetermined;

  return s.summary(url, pages, findingCount) + conformancePart + outcomePart + s.closing;
}
