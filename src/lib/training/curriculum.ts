// Training curriculum — versioned in code (not the DB). Concept lessons carry
// authored prose; sc-reference lessons render the WCAG SC data from
// `src/lib/standards/*` live. Quizzes carry their answer keys server-side.

export type ActivityType = "lesson" | "quiz";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  sc?: string;
}

export interface Quiz {
  id: string;
  title: string;
  passThreshold: number; // percent
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  type: "concept" | "sc-reference";
  body?: string;
  scs?: string[];
}

export interface Module {
  id: string;
  title: string;
  activities: Array<{ id: string; type: ActivityType }>;
}

export interface Path {
  id: string;
  title: string;
  version: string;
  modules: Module[];
}

export const LESSONS: Record<string, Lesson> = {
  "how-wcag-works": {
    id: "how-wcag-works",
    title: "How WCAG works",
    type: "concept",
    body: "WCAG 2.2 is organised around four principles (POUR): Perceivable, Operable, Understandable, and Robust. Each principle groups success criteria at three levels — A (minimum), AA (common legal target), and AAA (strictest).",
  },
  "understanding-severity": {
    id: "understanding-severity",
    title: "Understanding severity",
    type: "concept",
    body: "Severity measures real-world impact, not conformance level. Critical blocks a core task with no workaround; serious is a significant barrier; moderate is meaningful friction; minor is a nuisance. Severity and WCAG level are different axes.",
  },
  "contrast": {
    id: "contrast",
    title: "Contrast (minimum)",
    type: "sc-reference",
    scs: ["1.4.3", "1.4.11"],
  },
  "text-alternatives": {
    id: "text-alternatives",
    title: "Non-text content",
    type: "sc-reference",
    scs: ["1.1.1"],
  },
};

export const QUIZZES: Record<string, Quiz> = {
  "foundations-quiz": {
    id: "foundations-quiz",
    title: "Foundations check",
    passThreshold: 80,
    questions: [
      {
        id: "f1",
        prompt: "Which of the four WCAG principles does 1.4.3 (contrast) belong to?",
        options: ["Operable", "Perceivable", "Understandable", "Robust"],
        answerIndex: 1,
        explanation: "Contrast is about perceiving content, so it sits under Perceivable.",
      },
      {
        id: "f2",
        prompt: "A button's label is illegible at 3:1 contrast but the page still works. What severity is this most likely?",
        options: ["critical", "serious", "moderate", "minor"],
        answerIndex: 1,
        explanation: "A significant barrier that makes the task difficult — serious.",
        sc: "1.4.3",
      },
      {
        id: "f3",
        prompt: "Which conformance level is the common legal and best-practice target?",
        options: ["A", "AA", "AAA"],
        answerIndex: 1,
        explanation: "AA is the widely adopted target; AAA is stricter.",
      },
    ],
  },
  "perceivable-quiz": {
    id: "perceivable-quiz",
    title: "Perceivable check",
    passThreshold: 80,
    questions: [
      {
        id: "p1",
        prompt: "An image of a chart has alt=\"\" (empty). When is that correct?",
        options: [
          "Always — alt is optional",
          "When the image is decorative and conveys no information",
          "Never — every image needs descriptive alt",
        ],
        answerIndex: 1,
        explanation: "Decorative images use empty alt so screen readers skip them.",
        sc: "1.1.1",
      },
      {
        id: "p2",
        prompt: "Body text is #888 on white. Which WCAG SC does this most directly fail?",
        options: ["1.4.3 Contrast", "2.4.4 Link purpose", "1.1.1 Non-text content"],
        answerIndex: 0,
        explanation: "Low text contrast fails 1.4.3.",
        sc: "1.4.3",
      },
    ],
  },
};

export const PATH: Path = {
  id: "web-accessibility-foundation",
  title: "Web Accessibility Foundation",
  version: "1.0",
  modules: [
    {
      id: "foundations",
      title: "Foundations",
      activities: [
        { id: "how-wcag-works", type: "lesson" },
        { id: "understanding-severity", type: "lesson" },
        { id: "foundations-quiz", type: "quiz" },
      ],
    },
    {
      id: "perceivable",
      title: "Perceivable",
      activities: [
        { id: "contrast", type: "lesson" },
        { id: "text-alternatives", type: "lesson" },
        { id: "perceivable-quiz", type: "quiz" },
      ],
    },
  ],
};

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id];
}

export function getQuiz(id: string): Quiz | undefined {
  return QUIZZES[id];
}
