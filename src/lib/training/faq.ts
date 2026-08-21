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
