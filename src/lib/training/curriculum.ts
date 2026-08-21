// Training curriculum — versioned in code (not the DB). Concept lessons carry
// authored prose; sc-reference lessons render the WCAG SC data from
// `src/lib/standards/*` live (plus a short deep-dive body). Quizzes carry their
// answer keys server-side. `references` links each lesson to canonical sources.
//
// Structure: the 3-credit "Web Accessibility" course — Advocacy → Everyday →
// Standards → Audit. Standards is depth + method (10 anchor SCs + how-to-read-any-SC);
// the full 87 SCs / 13 guidelines remain reference material (the /standards index).

export type ActivityType = "lesson" | "quiz";

export interface LessonReference {
  label: string;
  href: string;
}

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
  references?: LessonReference[];
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

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export const LESSONS: Record<string, Lesson> = {
  // ---- Unit 1 · Advocacy ----
  "what-is-accessibility": {
    id: "what-is-accessibility",
    title: "What Is Web Accessibility",
    type: "concept",
    body: "Web accessibility means people with disabilities can perceive, understand, navigate, interact with, and contribute to the web. It is a subset of usability and distinct from inclusive design: accessibility removes barriers, while inclusive design seeks to exclude no one from the start.",
    references: [
      { label: "WAI Digital Accessibility Foundations", href: "https://www.w3.org/WAI/courses/foundations-course/" },
      { label: "WebAIM Introduction to Web Accessibility", href: "https://webaim.org/intro/" },
    ],
  },
  "how-people-use-the-web": {
    id: "how-people-use-the-web",
    title: "How People Use the Web",
    type: "concept",
    body: "People use assistive technologies and adaptive strategies: screen readers, magnification, keyboard-only navigation, voice control, and switch devices. Each reveals a different barrier — the same page can be unusable to one person and fine to another.",
    references: [
      { label: "WAI How People with Disabilities Use the Web", href: "https://www.w3.org/WAI/people-use-web/" },
      { label: "WAI Stories of Web Users", href: "https://www.w3.org/WAI/people-use-web/user-stories/" },
    ],
  },
  "disability-barriers": {
    id: "disability-barriers",
    title: "Disability Types & Barriers",
    type: "concept",
    body: "Disability is a mismatch between a person and an environment, not a personal deficit. Barriers fall into visual, auditory, motor, and cognitive categories — and can be permanent, temporary, or situational. Designing for one often helps many.",
    references: [{ label: "Microsoft Inclusive Design Toolkit", href: "https://inclusive.microsoft.design/" }],
  },
  "business-legal-case": {
    id: "business-legal-case",
    title: "Business & Legal Case",
    type: "concept",
    body: "Accessibility drives market reach, innovation, and brand trust — and reduces legal risk. Laws vary by jurisdiction: the ADA and Section 508 (US), EN 301 549 (EU), and equivalents elsewhere. Legal conformance is not identical to technical conformance.",
    references: [
      { label: "WAI Business Case", href: "https://www.w3.org/WAI/business-case/" },
      { label: "WAI Web Accessibility Laws & Policies", href: "https://www.w3.org/WAI/policies/" },
    ],
  },
  "inclusive-design-etiquette": {
    id: "inclusive-design-etiquette",
    title: "Inclusive Design & Etiquette",
    type: "concept",
    body: "Inclusive design follows 'recognise exclusion, learn from diversity, solve for one and extend to many.' Use the terminology individuals and communities use for themselves — person-first or identity-first are contextual preferences, not rules.",
    references: [
      { label: "Microsoft Inclusive 101 Guidebook", href: "https://inclusive.microsoft.design/articles/inclusive-101-guidebook" },
      { label: "ADA Network — writing about people with disabilities", href: "https://adata.org/factsheet/adann-writing/" },
    ],
  },
  "history-standards": {
    id: "history-standards",
    title: "History of WCAG & Standards",
    type: "concept",
    body: "WCAG 1.0 (1999) used 14 checkpoints; WCAG 2.0 (2008) reorganised into the four POUR principles with testable success criteria and A/AA/AAA levels (later ISO/IEC 40500). WCAG 2.1 (2018) added mobile/low-vision/cognitive criteria; 2.2 (2023) added focus appearance, target size, dragging, accessible authentication. WCAG 3.0 is in development. Related: Section 508, EN 301 549, ATAG (authoring tools), UAAG (user agents), WAI-ARIA.",
    references: [
      { label: "WCAG 2 Overview", href: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
      { label: "What's New in WCAG 2.2", href: "https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/" },
    ],
  },

  // ---- Unit 2 · Everyday accessibility ----
  "everyday-structure": {
    id: "everyday-structure",
    title: "Semantics & Structure",
    type: "sc-reference",
    scs: ["1.3.1", "2.4.6"],
    body: "Screen-reader users navigate by headings, landmarks, and lists — not by looking at the page. Use a real heading hierarchy (one h1, ordered levels), landmarks (header/nav/main/footer), and semantic lists. A page that looks structured but is a wall of divs is a wall to a screen reader.",
    references: [
      { label: "WAI Page Structure tutorial", href: "https://www.w3.org/WAI/tutorials/page-structure/" },
      { label: "WebAIM Semantic Structure", href: "https://webaim.org/techniques/semanticstructure/" },
    ],
  },
  "everyday-alt-text": {
    id: "everyday-alt-text",
    title: "Text Alternatives",
    type: "sc-reference",
    scs: ["1.1.1"],
    body: "Every image needs a decision: informative (describe the content), decorative (alt=\"\"), functional (describe the action), or complex (long description). The alt text replaces the image for someone who can't see it — write it as you would describe the image aloud.",
    references: [
      { label: "WAI Images tutorial", href: "https://www.w3.org/WAI/tutorials/images/" },
      { label: "WebAIM Alternative Text", href: "https://webaim.org/techniques/alttext/" },
    ],
  },
  "everyday-contrast": {
    id: "everyday-contrast",
    title: "Colour & Contrast",
    type: "sc-reference",
    scs: ["1.4.1", "1.4.3", "1.4.11"],
    body: "Low vision affects far more people than total blindness. Body text needs at least 4.5:1 (3:1 for large text), and colour must never be the only signal — pair red with an icon or text. Check real rendered colours, not just the stylesheet values.",
    references: [
      { label: "web.dev Color and contrast", href: "https://web.dev/learn/accessibility/color-contrast" },
      { label: "WebAIM Contrast Checker", href: "https://webaim.org/resources/contrastchecker/" },
    ],
  },
  "everyday-keyboard": {
    id: "everyday-keyboard",
    title: "Keyboard & Focus",
    type: "sc-reference",
    scs: ["2.1.1", "2.4.7", "2.4.11"],
    body: "Everything the mouse can do must be possible from the keyboard alone — and you must be able to see where you are. Never remove the focus outline; use native interactive elements so keyboard and focus 'just work'. Test by unplugging the mouse.",
    references: [
      { label: "web.dev Keyboard focus", href: "https://web.dev/learn/accessibility/focus" },
      { label: "MDN Keyboard accessibility", href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets" },
    ],
  },
  "everyday-links": {
    id: "everyday-links",
    title: "Links & Navigation",
    type: "sc-reference",
    scs: ["2.4.4", "2.4.1"],
    body: "Screen-reader users tab from link to link, hearing the text out of context. 'Click here' and 'Read more' are meaningless — the link text itself must say where it goes. Provide a skip link to bypass repeated navigation.",
    references: [
      { label: "WAI Tips — Writing for Web Accessibility", href: "https://www.w3.org/WAI/tips/writing/" },
    ],
  },
  "everyday-forms": {
    id: "everyday-forms",
    title: "Forms & Errors",
    type: "sc-reference",
    scs: ["3.3.1", "3.3.2", "4.1.2"],
    body: "Every input needs a visible, programmatic label; errors must be identified in text, described, and linked to the field. Use <label>, <fieldset>/<legend> for groups, and aria-describedby for hints and error messages — never placeholder text as a label.",
    references: [{ label: "WebAIM Forms", href: "https://webaim.org/techniques/forms/" }],
  },
  "everyday-media": {
    id: "everyday-media",
    title: "Media (Captions & Audio)",
    type: "sc-reference",
    scs: ["1.2.1", "1.2.2", "1.4.2"],
    body: "Video needs captions for people who can't hear and audio description or a transcript for people who can't see. Audio needs a transcript. Auto-playing audio must be controllable. Captions are the highest-impact fix for media.",
    references: [{ label: "web.dev Media accessibility", href: "https://web.dev/learn/accessibility/media" }],
  },
  "everyday-reflow": {
    id: "everyday-reflow",
    title: "Zoom, Reflow & Target Size",
    type: "sc-reference",
    scs: ["1.4.4", "1.4.10", "2.5.8"],
    body: "Content must reflow at 320 px and 400% zoom without horizontal scrolling, and text must resize without breaking. Interactive targets need to be at least 24×24 px (WCAG 2.2) — small links are a motor-accessibility barrier.",
    references: [
      { label: "WAI Easy Checks", href: "https://www.w3.org/WAI/test-evaluate/easy-checks/" },
    ],
  },

  // ---- Unit 3 · Standards (method + anchor SCs) ----
  "how-to-read-any-sc": {
    id: "how-to-read-any-sc",
    title: "How to Read Any Success Criterion",
    type: "concept",
    body: "You do not need to memorise 87 criteria — you need a method. For any SC: read the normative text, then its Understanding document (intent, benefits, examples), then Techniques (sufficient, advisory, and documented failures), then decide how to test it. The number encodes principle (first digit) and guideline (second digit).",
    references: [
      { label: "WCAG 2.2 (normative)", href: "https://www.w3.org/TR/WCAG22/" },
      { label: "Understanding WCAG 2.2", href: "https://www.w3.org/WAI/WCAG22/Understanding/" },
    ],
  },
  "sc-1.1.1": {
    id: "sc-1.1.1",
    title: "1.1.1 Non-text Content",
    type: "sc-reference",
    scs: ["1.1.1"],
    body: "The alt-text decision tree: informative → describe; decorative → empty alt; functional → describe the action; complex → long description. Failure: the image is announced as nothing, or as a filename. Test: tab through with a screen reader and ask what each image conveys.",
    references: [{ label: "WAI Images tutorial", href: "https://www.w3.org/WAI/tutorials/images/" }],
  },
  "sc-1.3.1": {
    id: "sc-1.3.1",
    title: "1.3.1 Info and Relationships",
    type: "sc-reference",
    scs: ["1.3.1"],
    body: "Programmatic structure must match the visual structure. Headings, landmarks, lists, tables, and <label> associations expose relationships to assistive technology. Failure: 'a heading is just bold text'; 'a form field has no label'.",
    references: [{ label: "Understanding 1.3.1", href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html" }],
  },
  "sc-1.4.3": {
    id: "sc-1.4.3",
    title: "1.4.3 Contrast (Minimum)",
    type: "sc-reference",
    scs: ["1.4.3"],
    body: "4.5:1 for normal text, 3:1 for large text and UI components. The judgement: compute the contrast ratio of rendered foreground/background. Failures: grey-on-white, text over a busy image. Test with a contrast checker, not by eye.",
    references: [{ label: "Understanding 1.4.3", href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" }],
  },
  "sc-1.4.10": {
    id: "sc-1.4.10",
    title: "1.4.10 Reflow",
    type: "sc-reference",
    scs: ["1.4.10"],
    body: "At 320 px (or 400% zoom on a 1280 px viewport) content must reflow to one column with no horizontal scrolling and no loss of function. Failure: a table or fixed-width layout that forces two-dimensional scrolling. Test by actually zooming to 400%.",
    references: [{ label: "Understanding 1.4.10", href: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html" }],
  },
  "sc-2.1.1": {
    id: "sc-2.1.1",
    title: "2.1.1 Keyboard",
    type: "sc-reference",
    scs: ["2.1.1"],
    body: "All functionality must be operable through a keyboard interface — not just 'reachable', but usable, with a visible focus and a logical order. Failure: a control with a click handler and no keyboard equivalent. Test: unplug the mouse.",
    references: [{ label: "Understanding 2.1.1", href: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html" }],
  },
  "sc-2.4.4": {
    id: "sc-2.4.4",
    title: "2.4.4 Link Purpose",
    type: "sc-reference",
    scs: ["2.4.4"],
    body: "The purpose of each link must be determinable from the link text alone, or from the link text plus its programmatic context. Failure: multiple 'Read more' links to different targets. Test: list all links and read each out of context.",
    references: [{ label: "Understanding 2.4.4", href: "https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html" }],
  },
  "sc-2.4.7": {
    id: "sc-2.4.7",
    title: "2.4.7 Focus Visible",
    type: "sc-reference",
    scs: ["2.4.7"],
    body: "Any keyboard-operable element must have a visible focus indicator. Failure: outline removed with :focus { outline: none } and no replacement. Test: tab through the page and confirm you can always see where you are.",
    references: [{ label: "Understanding 2.4.7", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" }],
  },
  "sc-2.5.8": {
    id: "sc-2.5.8",
    title: "2.5.8 Target Size (Minimum)",
    type: "sc-reference",
    scs: ["2.5.8"],
    body: "Targets must be at least 24×24 CSS pixels (with spacing exceptions) — a WCAG 2.2 criterion for motor and touch access. Failure: tiny text links with no padding. Test: measure the hit area, not the glyph.",
    references: [{ label: "Understanding 2.5.8", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" }],
  },
  "sc-3.3.1": {
    id: "sc-3.3.1",
    title: "3.3.1 Error Identification",
    type: "sc-reference",
    scs: ["3.3.1"],
    body: "When input is invalid, the error must be identified and described to the user in text, and the offending field identified. Failure: a form turns red with no message. Test: submit an invalid form and check a screen reader announces what's wrong.",
    references: [{ label: "Understanding 3.3.1", href: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html" }],
  },
  "sc-4.1.2": {
    id: "sc-4.1.2",
    title: "4.1.2 Name, Role, Value",
    type: "sc-reference",
    scs: ["4.1.2"],
    body: "Every UI component exposes its name, role, and value to assistive technology. Native elements do this for free; custom controls need an accessible name and correct role. Failure: a div that acts like a button but is announced as 'generic'.",
    references: [{ label: "Understanding 4.1.2", href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html" }],
  },
  "aria-restrained": {
    id: "aria-restrained",
    title: "ARIA, Used with Restraint",
    type: "concept",
    body: "ARIA communicates semantics; it does not supply keyboard behaviour. Use native HTML first; reach for ARIA only for things HTML cannot express (dialogs, live regions, custom widgets) — and when you add role, you own the keyboard interaction.",
    references: [
      { label: "MDN WAI-ARIA basics", href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics" },
      { label: "W3C ARIA Authoring Practices", href: "https://www.w3.org/WAI/ARIA/apg/" },
    ],
  },

  // ---- Unit 4 · Audit ----
  "audit-overview": {
    id: "audit-overview",
    title: "Evaluation Overview",
    type: "concept",
    body: "Automated tools assist, but no tool alone determines conformance — human judgement is required. An audit combines automated scans, manual inspection, and assistive-technology testing, documented with reproducible evidence.",
    references: [{ label: "WAI Evaluating Web Accessibility Overview", href: "https://www.w3.org/WAI/test-evaluate/" }],
  },
  "audit-easy-checks": {
    id: "audit-easy-checks",
    title: "Easy Checks (First Review)",
    type: "concept",
    body: "A quick first pass: page title, headings, contrast, alt text, keyboard access, zoom, and forms. Easy Checks finds obvious problems fast but is not a conformance evaluation.",
    references: [{ label: "WAI Easy Checks", href: "https://www.w3.org/WAI/test-evaluate/easy-checks/" }],
  },
  "audit-automated": {
    id: "audit-automated",
    title: "Automated Tools",
    type: "concept",
    body: "axe, WAVE, and Lighthouse catch ~30–50% of issues — and produce false positives. Treat each finding as a lead to verify manually, not a verdict.",
    references: [
      { label: "WebAIM WAVE", href: "https://wave.webaim.org/" },
      { label: "Microsoft Accessibility Insights", href: "https://accessibilityinsights.io/" },
    ],
  },
  "audit-manual": {
    id: "audit-manual",
    title: "Manual Testing",
    type: "concept",
    body: "The parts automation can't judge: keyboard-only operation, focus order, contrast of rendered pixels, heading hierarchy, and error handling. This is the core of any credible audit.",
    references: [{ label: "WebAIM Evaluation Guide", href: "https://webaim.org/articles/evaluationguide/" }],
  },
  "audit-screen-reader": {
    id: "audit-screen-reader",
    title: "Screen-Reader Testing",
    type: "concept",
    body: "Test with a real screen reader (NVDA + Chrome, VoiceOver + Safari): reading order, headings, landmarks, links, forms, and dynamic updates. This catches what code inspection cannot.",
    references: [
      { label: "WebAIM Using NVDA", href: "https://webaim.org/articles/nvda/" },
      { label: "WebAIM Using VoiceOver", href: "https://webaim.org/articles/voiceover/" },
    ],
  },
  "audit-wcag-em": {
    id: "audit-wcag-em",
    title: "WCAG-EM & VPAT/ACR",
    type: "concept",
    body: "WCAG-EM is the evaluation methodology: define scope → explore the product → select a representative sample → evaluate the sample → report. A VPAT is a blank template; a completed VPAT for a specific product is an Accessibility Conformance Report (ACR).",
    references: [
      { label: "W3C WCAG-EM", href: "https://www.w3.org/TR/WCAG-EM/" },
      { label: "ITI VPAT templates", href: "https://www.itic.org/policy/accessibility/vpat" },
    ],
  },
  "capstone-audit": {
    id: "capstone-audit",
    title: "Capstone: Audit a Website",
    type: "concept",
    body: "Put it together: run a real audit. Pick a small site, follow the WCAG-EM five steps (define scope, explore, select a representative sample, evaluate against WCAG 2.2 AA, report), and document your evidence. Use the Run a scan tool to get the automated baseline, then verify by keyboard and screen reader.",
    references: [
      { label: "W3C WCAG-EM", href: "https://www.w3.org/TR/WCAG-EM/" },
      { label: "Run a scan", href: "/assess" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Quizzes (scenario/application, not recall)
// ---------------------------------------------------------------------------

export const QUIZZES: Record<string, Quiz> = {
  "advocacy-quiz": {
    id: "advocacy-quiz",
    title: "Advocacy Check",
    passThreshold: 80,
    questions: [
      {
        id: "a1",
        prompt: "A designer says: \"Blind users are our only accessibility audience, so if a page works with a screen reader we're done.\" What is wrong with this?",
        options: [
          "Nothing — screen-reader support covers all disabilities",
          "It ignores low-vision, motor, hearing, and cognitive barriers, which are far more common",
          "Screen readers are no longer widely used",
        ],
        answerIndex: 1,
        explanation: "Blind users are a minority of the disabled population; low vision, motor, hearing, and cognitive barriers each need their own fixes.",
      },
      {
        id: "a2",
        prompt: "Which shift did WCAG 2.0 introduce relative to WCAG 1.0?",
        options: [
          "The four POUR principles and testable success criteria",
          "The first requirement for captions",
          "A ban on JavaScript",
        ],
        answerIndex: 0,
        explanation: "WCAG 2.0 reorganised 14 checkpoints into the four POUR principles with testable success criteria and A/AA/AAA levels.",
      },
      {
        id: "a3",
        prompt: "A manager asks why the company should invest in accessibility. Which argument is weakest?",
        options: [
          "It reduces legal risk",
          "It expands market reach and improves SEO",
          "It is required by the WCAG standard for all private companies worldwide",
        ],
        answerIndex: 2,
        explanation: "WCAG is a technical standard, not a universal legal mandate — laws vary by jurisdiction.",
      },
    ],
  },
  "everyday-quiz": {
    id: "everyday-quiz",
    title: "Everyday Check",
    passThreshold: 80,
    questions: [
      {
        id: "e1",
        prompt: "An image of a decorative horizontal rule is given alt=\"divider line\". What should it be instead?",
        options: ["alt=\"\"", "alt=\"decorative image\"", "A <hr> element instead"],
        answerIndex: 2,
        explanation: "A decorative rule is best conveyed as a semantic <hr>; if it must be an image, use empty alt so it is ignored.",
      },
      {
        id: "e2",
        prompt: "A form input uses placeholder=\"Email address\" and has no <label>. Why is this a problem?",
        options: [
          "Placeholder text is announced as the label by all screen readers",
          "The placeholder disappears on focus and is often skipped by assistive tech",
          "It is not a problem",
        ],
        answerIndex: 1,
        explanation: "Placeholder disappears as the user types and is inconsistently exposed — a real <label> is required.",
        sc: "3.3.2",
      },
      {
        id: "e3",
        prompt: "You find body text at #888888 on white. Which SC does this most directly fail, and what ratio is needed?",
        options: [
          "1.4.1 — 3:1",
          "1.4.3 — 4.5:1",
          "1.4.11 — 3:1 for UI components",
        ],
        answerIndex: 1,
        explanation: "#888 on white is roughly 3.5:1, below the 4.5:1 required by 1.4.3 for normal text.",
        sc: "1.4.3",
      },
    ],
  },
  "perceivable-quiz": {
    id: "perceivable-quiz",
    title: "Perceivable Check",
    passThreshold: 80,
    questions: [
      {
        id: "pr1",
        prompt: "A complex data chart is an <img>. What is the correct approach for 1.1.1?",
        options: [
          "alt=\"chart\"",
          "A concise alt plus a long description or data table nearby",
          "Remove the image",
        ],
        answerIndex: 1,
        explanation: "Complex images need a short alt plus a long description (or an equivalent data table).",
        sc: "1.1.1",
      },
      {
        id: "pr2",
        prompt: "A page works at 1280 px but forces horizontal scrolling at 320 px. Which SC fails?",
        options: ["1.4.3", "1.4.10", "2.4.7"],
        answerIndex: 1,
        explanation: "1.4.10 Reflow requires content to reflow at 320 px without two-dimensional scrolling.",
        sc: "1.4.10",
      },
    ],
  },
  "operable-quiz": {
    id: "operable-quiz",
    title: "Operable Check",
    passThreshold: 80,
    questions: [
      {
        id: "op1",
        prompt: "A dropdown opens on mouse hover but not on keyboard focus, and cannot be dismissed with Escape. Which SC(s) fail?",
        options: ["1.4.13 only", "2.1.1 (keyboard) and 1.4.13", "No SC fails — hover is enough"],
        answerIndex: 1,
        explanation: "Keyboard operability (2.1.1) and dismissible/hoverable content (1.4.13) both apply.",
      },
      {
        id: "op2",
        prompt: "A button removes its focus outline with :focus { outline: none }. What fails and why does it matter?",
        options: [
          "2.4.7 — keyboard users can't tell where focus is",
          "1.4.3 — the outline had low contrast",
          "Nothing — outlines are optional",
        ],
        answerIndex: 0,
        explanation: "Removing the visible focus indicator fails 2.4.7 Focus Visible.",
        sc: "2.4.7",
      },
    ],
  },
  "understandable-quiz": {
    id: "understandable-quiz",
    title: "Understandable Check",
    passThreshold: 80,
    questions: [
      {
        id: "u1",
        prompt: "A login form rejects an incorrect password with only a red border around the field. What fails?",
        options: [
          "1.4.3 only",
          "3.3.1 — the error is not identified or described in text",
          "Nothing — the red border is sufficient",
        ],
        answerIndex: 1,
        explanation: "3.3.1 requires errors to be identified and described in text; colour alone is not enough.",
        sc: "3.3.1",
      },
      {
        id: "u2",
        prompt: "A page mixes English and Chinese sentences without marking the language changes. Which SC should you check?",
        options: ["2.4.4", "3.1.2", "1.4.5"],
        answerIndex: 1,
        explanation: "3.1.2 Language of Parts requires in-page language changes to be identified.",
        sc: "3.1.2",
      },
    ],
  },
  "robust-quiz": {
    id: "robust-quiz",
    title: "Robust Check",
    passThreshold: 80,
    questions: [
      {
        id: "r1",
        prompt: "A custom toggle is a <div role=\"switch\" aria-checked=\"true\"> with no keyboard handling. What's wrong?",
        options: [
          "Nothing — ARIA makes it accessible",
          "ARIA supplies the role but not the keyboard behaviour; it still needs focus and Space/Enter handling",
          "Only a <button> can be a toggle",
        ],
        answerIndex: 1,
        explanation: "ARIA communicates semantics but not interaction — keyboard operation (2.1.1) must be implemented.",
        sc: "4.1.2",
      },
    ],
  },
  "audit-quiz": {
    id: "audit-quiz",
    title: "Audit Check",
    passThreshold: 80,
    questions: [
      {
        id: "au1",
        prompt: "An automated scan reports 0 violations. What is the correct conclusion?",
        options: [
          "The site is conformant",
          "The site passed automated checks only — manual and assistive-technology testing are still required",
          "The site needs no further work",
        ],
        answerIndex: 1,
        explanation: "Automated tools catch a fraction of issues; conformance requires human evaluation.",
      },
      {
        id: "au2",
        prompt: "In WCAG-EM, why do you 'select a representative sample' rather than test every page?",
        options: [
          "It is faster",
          "To evaluate a manageable, defensible subset of pages, templates, and states",
          "WCAG does not require testing",
        ],
        answerIndex: 1,
        explanation: "WCAG-EM step 3 selects common pages, templates, states, and complete processes so the scope is defensible.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Path (the course)
// ---------------------------------------------------------------------------

export const PATH: Path = {
  id: "web-accessibility",
  title: "Web Accessibility",
  version: "2.0",
  modules: [
    {
      id: "advocacy",
      title: "Advocacy",
      activities: [
        { id: "what-is-accessibility", type: "lesson" },
        { id: "how-people-use-the-web", type: "lesson" },
        { id: "disability-barriers", type: "lesson" },
        { id: "business-legal-case", type: "lesson" },
        { id: "inclusive-design-etiquette", type: "lesson" },
        { id: "history-standards", type: "lesson" },
        { id: "advocacy-quiz", type: "quiz" },
      ],
    },
    {
      id: "everyday",
      title: "Everyday Accessibility",
      activities: [
        { id: "everyday-structure", type: "lesson" },
        { id: "everyday-alt-text", type: "lesson" },
        { id: "everyday-contrast", type: "lesson" },
        { id: "everyday-keyboard", type: "lesson" },
        { id: "everyday-links", type: "lesson" },
        { id: "everyday-forms", type: "lesson" },
        { id: "everyday-media", type: "lesson" },
        { id: "everyday-reflow", type: "lesson" },
        { id: "everyday-quiz", type: "quiz" },
      ],
    },
    {
      id: "standards",
      title: "Standards",
      activities: [
        { id: "how-to-read-any-sc", type: "lesson" },
        { id: "sc-1.1.1", type: "lesson" },
        { id: "sc-1.3.1", type: "lesson" },
        { id: "sc-1.4.3", type: "lesson" },
        { id: "sc-1.4.10", type: "lesson" },
        { id: "sc-2.1.1", type: "lesson" },
        { id: "sc-2.4.4", type: "lesson" },
        { id: "sc-2.4.7", type: "lesson" },
        { id: "sc-2.5.8", type: "lesson" },
        { id: "sc-3.3.1", type: "lesson" },
        { id: "sc-4.1.2", type: "lesson" },
        { id: "aria-restrained", type: "lesson" },
        { id: "perceivable-quiz", type: "quiz" },
        { id: "operable-quiz", type: "quiz" },
        { id: "understandable-quiz", type: "quiz" },
        { id: "robust-quiz", type: "quiz" },
      ],
    },
    {
      id: "audit",
      title: "Audit",
      activities: [
        { id: "audit-overview", type: "lesson" },
        { id: "audit-easy-checks", type: "lesson" },
        { id: "audit-automated", type: "lesson" },
        { id: "audit-manual", type: "lesson" },
        { id: "audit-screen-reader", type: "lesson" },
        { id: "audit-wcag-em", type: "lesson" },
        { id: "audit-quiz", type: "quiz" },
        { id: "capstone-audit", type: "lesson" },
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

// Per-lesson metadata + a single formative practice check (answer key stays
// server-side). Kept separate from the lesson body to bound authoring scope.
export interface LessonMeta {
  outcome: string;
  durationMinutes: number;
  check: QuizQuestion;
}

export const LESSON_META: Record<string, LessonMeta> = {
  // ---- Unit 1 · Advocacy ----
  "what-is-accessibility": {
    outcome: "Distinguish accessibility, usability, and inclusive design.",
    durationMinutes: 5,
    check: { id: "c1", prompt: "A page has zero WCAG violations but is awkward for everyone to use. Which is true?", options: ["It is automatically usable", "Accessibility and usability overlap but are not identical", "WCAG is the only quality measure"], answerIndex: 1, explanation: "A page can conform yet still be a poor experience — accessibility removes barriers, usability is broader." },
  },
  "how-people-use-the-web": {
    outcome: "Name the assistive technologies people use to browse the web.",
    durationMinutes: 8,
    check: { id: "c2", prompt: "Which assistive technology most helps someone with low vision read text?", options: ["Screen reader", "Screen magnifier", "Voice control"], answerIndex: 1, explanation: "Magnification enlarges content for low-vision users; a screen reader announces it for blind users." },
  },
  "disability-barriers": {
    outcome: "Recognise that disability is a person–environment mismatch.",
    durationMinutes: 5,
    check: { id: "c3", prompt: "Which is the best example of a temporary disability?", options: ["Blindness", "A broken arm limiting mouse use", "Dyslexia"], answerIndex: 1, explanation: "A broken arm is temporary and situational — designing for it helps everyone." },
  },
  "business-legal-case": {
    outcome: "Explain the business and legal drivers for accessibility.",
    durationMinutes: 5,
    check: { id: "c4", prompt: "Which standard governs digital accessibility for the EU public sector?", options: ["ADA", "Section 508", "EN 301 549"], answerIndex: 2, explanation: "EN 301 549 is the EU standard; Section 508 is US, the ADA is US law." },
  },
  "inclusive-design-etiquette": {
    outcome: "Use respectful, person-centred language about disability.",
    durationMinutes: 5,
    check: { id: "c5", prompt: "Person-first vs identity-first language is best described as:", options: ["A strict rule", "A contextual preference — use the person's own terms", "Only identity-first is correct"], answerIndex: 1, explanation: "Communities and individuals differ; follow the terminology people use for themselves." },
  },
  "history-standards": {
    outcome: "Trace WCAG 1.0→2.2 and name the related standards.",
    durationMinutes: 8,
    check: { id: "c6", prompt: "Which WCAG version introduced the four POUR principles?", options: ["1.0", "2.0", "2.2"], answerIndex: 1, explanation: "WCAG 2.0 (2008) reorganised 14 checkpoints into POUR with testable success criteria." },
  },
  // ---- Unit 2 · Everyday ----
  "everyday-structure": {
    outcome: "Build pages with a semantic heading and landmark structure.",
    durationMinutes: 8,
    check: { id: "c7", prompt: "A page is a wall of <div>s with no landmarks. Best fix?", options: ["Add more <div>s", "Use header/nav/main/footer and real headings", "Style the divs to look like sections"], answerIndex: 1, explanation: "Landmarks and a real heading hierarchy expose structure to assistive technology." },
  },
  "everyday-alt-text": {
    outcome: "Write appropriate alt text for any image.",
    durationMinutes: 8,
    check: { id: "c8", prompt: "A purely decorative image should have:", options: ["alt=\"decorative\"", "alt=\"\"", "A long description"], answerIndex: 1, explanation: "Empty alt hides the image from screen readers — the correct treatment for decoration." },
  },
  "everyday-contrast": {
    outcome: "Check text contrast against WCAG minimums.",
    durationMinutes: 8,
    check: { id: "c9", prompt: "What contrast ratio does normal body text need at WCAG AA?", options: ["3:1", "4.5:1", "7:1"], answerIndex: 1, explanation: "4.5:1 is the AA minimum for normal text; 7:1 is the AAA target." },
  },
  "everyday-keyboard": {
    outcome: "Make every control operable by keyboard with visible focus.",
    durationMinutes: 8,
    check: { id: "c10", prompt: "A menu opens on hover but not keyboard focus. The fix is:", options: ["Ignore it — hover is enough", "Add keyboard and focus handling", "Disable the menu"], answerIndex: 1, explanation: "Anything operable by mouse must also be operable by keyboard, with visible focus." },
  },
  "everyday-links": {
    outcome: "Write link text that describes its destination.",
    durationMinutes: 5,
    check: { id: "c11", prompt: "Five 'Read more' links go to different pages. Best fix?", options: ["Make each link text describe its target", "Add a title attribute", "Leave them"], answerIndex: 0, explanation: "Link text must say where it goes; 'Read more' is meaningless out of context." },
  },
  "everyday-forms": {
    outcome: "Label every form field and describe errors in text.",
    durationMinutes: 8,
    check: { id: "c12", prompt: "A text input has only placeholder text and no <label>. Best fix?", options: ["Add a real <label>", "Darken the placeholder", "It is fine"], answerIndex: 0, explanation: "Placeholder disappears and is inconsistently exposed — a real <label> is required." },
  },
  "everyday-media": {
    outcome: "Provide captions and transcripts for media.",
    durationMinutes: 5,
    check: { id: "c13", prompt: "Prerecorded video with speech needs, at AA minimum:", options: ["Captions", "Sign language", "No extra content"], answerIndex: 0, explanation: "1.2.2 requires captions for prerecorded audio in synchronized media." },
  },
  "everyday-reflow": {
    outcome: "Verify content reflows without horizontal scroll at 400% zoom.",
    durationMinutes: 5,
    check: { id: "c14", prompt: "At 400% zoom the page forces horizontal scrolling. Which SC fails?", options: ["1.4.3", "1.4.10", "2.4.7"], answerIndex: 1, explanation: "1.4.10 Reflow requires content to reflow at 320px / 400% without two-dimensional scroll." },
  },
  // ---- Unit 3 · Standards ----
  "how-to-read-any-sc": {
    outcome: "Read and interpret any WCAG success criterion.",
    durationMinutes: 8,
    check: { id: "c15", prompt: "To interpret an unfamiliar SC, read first:", options: ["The Techniques only", "Its Understanding document", "A random blog"], answerIndex: 1, explanation: "Understanding documents explain intent, benefits, examples — the starting point after the normative text." },
  },
  "sc-1.1.1": {
    outcome: "Apply the alt-text decision tree to any image.",
    durationMinutes: 10,
    check: { id: "c16", prompt: "A complex data chart needs:", options: ["alt=\"chart\" only", "A short alt plus a long description or data table", "No alt"], answerIndex: 1, explanation: "Complex images need a short alt plus a long description (or an equivalent data table)." },
  },
  "sc-1.3.1": {
    outcome: "Expose structure and relationships programmatically.",
    durationMinutes: 10,
    check: { id: "c17", prompt: "A field's label is only visual (not associated). Which SC fails?", options: ["1.3.1", "1.4.3", "2.5.8"], answerIndex: 0, explanation: "1.3.1 requires information and relationships be programmatically determinable — a real <label>." },
  },
  "sc-1.4.3": {
    outcome: "Judge text contrast against 4.5:1 / 3:1.",
    durationMinutes: 10,
    check: { id: "c18", prompt: "Body text at #888 on white (≈3.5:1) fails:", options: ["1.4.3", "2.4.4", "1.1.1"], answerIndex: 0, explanation: "3.5:1 is below the 4.5:1 minimum for normal text — a 1.4.3 failure." },
  },
  "sc-1.4.10": {
    outcome: "Test reflow at 320px and 400% zoom.",
    durationMinutes: 10,
    check: { id: "c19", prompt: "A fixed-width layout forces horizontal scrolling at 320px. This fails:", options: ["1.4.10", "2.4.4", "3.3.1"], answerIndex: 0, explanation: "Reflow (1.4.10) requires one-column reflow with no two-dimensional scroll." },
  },
  "sc-2.1.1": {
    outcome: "Verify every control is keyboard-operable.",
    durationMinutes: 10,
    check: { id: "c20", prompt: "A control has an onclick but no keyboard handling. This fails:", options: ["2.1.1", "1.4.3", "4.1.2"], answerIndex: 0, explanation: "2.1.1 requires all functionality be operable via keyboard." },
  },
  "sc-2.4.4": {
    outcome: "Write link text that is clear in context.",
    durationMinutes: 10,
    check: { id: "c21", prompt: "A link labelled 'Click here' points to a policy page. This fails:", options: ["2.4.4", "1.4.3", "2.5.8"], answerIndex: 0, explanation: "2.4.4 requires link purpose be clear from the link text (plus context)." },
  },
  "sc-2.4.7": {
    outcome: "Keep a visible focus indicator on every control.",
    durationMinutes: 10,
    check: { id: "c22", prompt: "CSS removes the focus outline with no replacement. This fails:", options: ["2.4.7", "1.1.1", "3.3.1"], answerIndex: 0, explanation: "2.4.7 requires any keyboard-operable UI to have a visible focus indicator." },
  },
  "sc-2.5.8": {
    outcome: "Verify interactive targets meet 24×24px minimum.",
    durationMinutes: 10,
    check: { id: "c25", prompt: "Tiny text links with no padding are below 24×24px. This fails:", options: ["2.5.8", "1.4.3", "3.3.1"], answerIndex: 0, explanation: "2.5.8 (WCAG 2.2) requires targets of at least 24×24 CSS pixels." },
  },
  "sc-3.3.1": {
    outcome: "Identify and describe input errors in text.",
    durationMinutes: 10,
    check: { id: "c23", prompt: "A form shows only a red border on an invalid field. This fails:", options: ["3.3.1", "2.4.4", "1.4.10"], answerIndex: 0, explanation: "3.3.1 requires errors be identified and described in text — colour alone is not enough." },
  },
  "sc-4.1.2": {
    outcome: "Ensure every control exposes name, role, and value.",
    durationMinutes: 10,
    check: { id: "c24", prompt: "A <div> acts as a button but has no role or name. This fails:", options: ["4.1.2", "1.4.3", "2.4.7"], answerIndex: 0, explanation: "4.1.2 requires UI components expose their name, role, and value." },
  },
  "aria-restrained": {
    outcome: "Use ARIA only when native HTML cannot express the semantics.",
    durationMinutes: 8,
    check: { id: "c26", prompt: "When should you reach for ARIA?", options: ["Always, for robustness", "Only when native HTML cannot express it", "Never"], answerIndex: 1, explanation: "Native HTML first; ARIA communicates semantics but not keyboard behaviour." },
  },
  // ---- Unit 4 · Audit ----
  "audit-overview": {
    outcome: "Explain why conformance needs human judgement.",
    durationMinutes: 5,
    check: { id: "c27", prompt: "Can automated tools alone determine conformance?", options: ["Yes, if they report zero errors", "No — human evaluation is required", "Yes, for AA"], answerIndex: 1, explanation: "Tools assist but miss ~50% of issues; conformance requires human judgement." },
  },
  "audit-easy-checks": {
    outcome: "Run a quick first-pass review of a page.",
    durationMinutes: 8,
    check: { id: "c28", prompt: "Easy Checks are best described as:", options: ["A full conformance evaluation", "A quick first review", "An automated scan"], answerIndex: 1, explanation: "Easy Checks are a fast preliminary review, not a conformance evaluation." },
  },
  "audit-automated": {
    outcome: "Use automated tools critically, verifying findings manually.",
    durationMinutes: 8,
    check: { id: "c29", prompt: "An automated scan reports zero errors. Best response?", options: ["Declare the site conformant", "Verify manually — tools miss many issues", "Ship it"], answerIndex: 1, explanation: "Automated tools catch a fraction of issues and produce false positives and misses." },
  },
  "audit-manual": {
    outcome: "Perform keyboard, focus, and contrast testing by hand.",
    durationMinutes: 8,
    check: { id: "c30", prompt: "Which is a manual test (not automated)?", options: ["Running axe", "Keyboard-only navigation", "Lighthouse score"], answerIndex: 1, explanation: "Keyboard-only operation is a manual test that automation cannot judge." },
  },
  "audit-screen-reader": {
    outcome: "Test a page with a real screen reader.",
    durationMinutes: 8,
    check: { id: "c31", prompt: "A common screen-reader test pairing is:", options: ["NVDA + Chrome (Windows)", "axe + Lighthouse", "VoiceOver + axe"], answerIndex: 0, explanation: "NVDA + Chrome on Windows (and VoiceOver + Safari on macOS) is a standard pairing." },
  },
  "audit-wcag-em": {
    outcome: "Structure an audit using WCAG-EM's five steps.",
    durationMinutes: 8,
    check: { id: "c32", prompt: "The correct WCAG-EM order is:", options: ["Explore → scope → evaluate → report", "Scope → explore → sample → evaluate → report", "Report → evaluate → sample"], answerIndex: 1, explanation: "WCAG-EM: define scope, explore, select a sample, evaluate, report." },
  },
  "capstone-audit": {
    outcome: "Complete a WCAG-EM audit and produce a conformance report.",
    durationMinutes: 30,
    check: { id: "c33", prompt: "The capstone deliverable is:", options: ["A passing quiz score", "An evidence-based conformance report", "A code sample"], answerIndex: 1, explanation: "The capstone is an evidence-based WCAG-EM report — the authentic assessment." },
  },
};
