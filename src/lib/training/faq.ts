export interface FaqEntry {
  q: string;
  a: string;
}

export const COURSE_FAQ: FaqEntry[] = [
  {
    q: "Is the course free?",
    a: "Yes — 100% free, including the final assessment and the PDF certificate. There is no paywall.",
  },
  {
    q: "Do I need to sign in?",
    a: "You can browse every lesson signed out. Sign in to save your progress and earn the certificate.",
  },
  {
    q: "How long does it take?",
    a: "About 7 hours of active learning across four units, plus the capstone audit. Learn at your own pace.",
  },
  {
    q: "Do I need to know how to code?",
    a: "Familiarity with HTML and CSS helps, but no JavaScript is required. The course teaches the concepts from scratch.",
  },
  {
    q: "What standard does it teach?",
    a: "WCAG 2.2 (levels A, AA, AAA), plus its history and the related standards: Section 508, EN 301 549, ATAG, UAAG, and WAI-ARIA.",
  },
  {
    q: "Is the certificate verifiable?",
    a: "Yes — each certificate has a stable verification URL and a downloadable PDF.",
  },
  {
    q: "Is this an official qualification?",
    a: "No. It is a course-completion credential, not an accredited qualification and not the IAAP CPACC/WAS certification (though it prepares toward those).",
  },
  {
    q: "How is my progress saved?",
    a: "Automatically when you are signed in — every lesson, quiz, and your current position.",
  },
  {
    q: "Can I retake the quizzes?",
    a: "Yes. Retake a full quiz, or use 'retry missed questions' to only redo the ones you got wrong.",
  },
  {
    q: "What do I need for the capstone?",
    a: "Just a browser — the built-in 'Run a scan' tool provides the automated baseline, and you verify by keyboard and screen reader.",
  },
];

const COURSE_FAQ_ZH_HANT: FaqEntry[] = [
  { q: "課程免費嗎？", a: "是的 — 100% 免費，包含最終評量與 PDF 證書。沒有付費牆。" },
  { q: "我需要登入嗎？", a: "你可以未登入瀏覽所有課程。登入即可儲存進度並取得證書。" },
  { q: "需要多久時間？", a: "四個單元約需 7 小時的積極學習，外加專題稽核。可依自己的步調學習。" },
  { q: "我需要會寫程式嗎？", a: "熟悉 HTML 與 CSS 有幫助，但不需要 JavaScript。課程從頭教授這些概念。" },
  { q: "課程教的是哪個標準？", a: "WCAG 2.2（A、AA、AAA 等級），加上其歷史與相關標準：Section 508、EN 301 549、ATAG、UAAG 及 WAI-ARIA。" },
  { q: "證書可以驗證嗎？", a: "可以 — 每張證書都有穩定的驗證網址及可下載的 PDF。" },
  { q: "這是正式資格嗎？", a: "不是。這是課程完成憑證，並非經認證的資格，也不是 IAAP CPACC/WAS 認證（雖然它可為此做準備）。" },
  { q: "我的進度如何儲存？", a: "登入時會自動儲存 — 每堂課程、測驗及你目前的位置。" },
  { q: "可以重考測驗嗎？", a: "可以。重考完整測驗，或使用「重做答錯的題目」只重做答錯的部分。" },
  { q: "專題需要什麼？", a: "只需瀏覽器 — 內建的「執行掃描」工具提供自動化基準，你再以鍵盤與螢幕閱讀器驗證。" },
];

const COURSE_FAQ_ZH_HANS: FaqEntry[] = [
  { q: "课程免费吗？", a: "是的 — 100% 免费，包含最终评量与 PDF 证书。没有付费墙。" },
  { q: "我需要登录吗？", a: "你可以未登录浏览所有课程。登录即可保存进度并取得证书。" },
  { q: "需要多久时间？", a: "四个单元约需 7 小时的积极学习，外加专题审计。可依自己的步调学习。" },
  { q: "我需要会写代码吗？", a: "熟悉 HTML 与 CSS 有帮助，但不需要 JavaScript。课程从头教授这些概念。" },
  { q: "课程教的是哪个标准？", a: "WCAG 2.2（A、AA、AAA 等级），加上其历史与相关标准：Section 508、EN 301 549、ATAG、UAAG 及 WAI-ARIA。" },
  { q: "证书可以验证吗？", a: "可以 — 每张证书都有稳定的验证网址及可下载的 PDF。" },
  { q: "这是正式资格吗？", a: "不是。这是课程完成凭证，并非经认证的资格，也不是 IAAP CPACC/WAS 认证（虽然它可为此做准备）。" },
  { q: "我的进度如何保存？", a: "登录时会自动保存 — 每堂课程、测验及你当前的位置。" },
  { q: "可以重考测验吗？", a: "可以。重考完整测验，或使用「重做答错的题目」只重做答错的部分。" },
  { q: "专题需要什么？", a: "只需浏览器 — 内置的「执行扫描」工具提供自动化基准，你再以键盘与屏幕阅读器验证。" },
];

export function courseFaqFor(locale?: string): FaqEntry[] {
  if (locale === "zh-Hant") return COURSE_FAQ_ZH_HANT;
  if (locale === "zh-Hans") return COURSE_FAQ_ZH_HANS;
  return COURSE_FAQ;
}
