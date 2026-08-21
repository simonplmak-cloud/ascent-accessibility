// Plain-language accessibility glossary. Each term has a short definition and a
// one-line "why it matters" — written for a first-time, non-expert reader
// (NGO/government), with jargon defined at first use and links to go deeper.

export interface GlossaryTerm {
  term: string;
  definition: string;
  why: string;
  href?: string;
  hrefLabel?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Accessibility (web accessibility)",
    definition: "Websites and apps that everyone can use, including people with disabilities.",
    why: "Accessibility removes barriers so no one is locked out.",
  },
  {
    term: "WCAG",
    definition: "Web Content Accessibility Guidelines — the international standard for web accessibility.",
    why: "It is the rulebook most accessibility laws and policies point to.",
    href: "/standards",
    hrefLabel: "See the WCAG criteria",
  },
  {
    term: "Success criterion (SC)",
    definition: "A single, testable rule in WCAG, such as “images must have a text alternative”.",
    why: "Each one is a specific thing you can check on a page.",
    href: "/standards",
    hrefLabel: "Browse all criteria",
  },
  {
    term: "POUR",
    definition: "The four principles WCAG is built on: Perceivable, Operable, Understandable, Robust.",
    why: "It is a simple way to group every rule in the standard.",
  },
  {
    term: "Level A / AA / AAA",
    definition: "The three levels of WCAG conformance, from basic (A) to highest (AAA).",
    why: "Most laws and policies ask for level AA. This site itself targets AAA.",
  },
  {
    term: "Alt text (text alternative)",
    definition: "A short written description of an image, read aloud by screen readers.",
    why: "It tells people who cannot see the image what it shows.",
  },
  {
    term: "Screen reader",
    definition: "Software that reads the screen aloud for people who are blind or have low vision.",
    why: "It is one of the main tools people use to browse the web.",
  },
  {
    term: "Assistive technology",
    definition: "Any tool that helps a person with a disability use the web — a screen reader, magnifier, switch device, or voice control.",
    why: "Good websites work with these tools, not against them.",
  },
  {
    term: "Keyboard accessible",
    definition: "Everything on the page can be used with a keyboard alone — no mouse needed.",
    why: "Many people navigate by keyboard, switch device, or voice control.",
  },
  {
    term: "Focus indicator",
    definition: "The visible outline that shows where you are on the page when using a keyboard.",
    why: "Without it, keyboard users get lost.",
  },
  {
    term: "Colour contrast ratio",
    definition: "A measure of how different the text colour is from its background.",
    why: "Low contrast makes text hard to read, especially for people with low vision.",
  },
  {
    term: "Landmark",
    definition: "A labelled region of a page, such as the header, navigation, or main content.",
    why: "Screen-reader users jump between landmarks to find things fast.",
  },
  {
    term: "Heading structure",
    definition: "Using real headings (h1, h2, h3) in the right order to outline the page.",
    why: "It is how screen-reader users skim and navigate.",
  },
  {
    term: "ARIA",
    definition: "A set of HTML attributes that add accessibility information to custom controls.",
    why: "Used carefully it fills gaps HTML alone cannot — but native HTML always comes first.",
  },
  {
    term: "Conformance",
    definition: "How well a site meets WCAG — whether it passes, fails, or needs human review.",
    why: "It is the honest measure of where your site stands.",
  },
  {
    term: "Automated test",
    definition: "A check run by software, with no human judgement.",
    why: "Fast and consistent, but it can only catch part of the picture.",
  },
  {
    term: "Manual test",
    definition: "A check done by a person, such as testing with a keyboard or a screen reader.",
    why: "Some things only a human can judge.",
  },
  {
    term: "AI-assisted review",
    definition: "Using AI to help check the things automation alone cannot decide.",
    why: "It narrows the gap, but a person still confirms the result — it is not proof.",
  },
  {
    term: "VPAT / ACR",
    definition: "A VPAT is a blank accessibility report template; a completed one is an Accessibility Conformance Report (ACR).",
    why: "Buyers, funders, and procurement teams often ask for one.",
    href: "/human-review",
    hrefLabel: "About independent review",
  },
  {
    term: "WCAG-EM",
    definition: "The official step-by-step method for evaluating a website against WCAG.",
    why: "It is how a credible, repeatable audit is done.",
    href: "/methodology",
    hrefLabel: "Our methodology",
  },
  {
    term: "Section 508",
    definition: "A United States law requiring federal websites to be accessible.",
    why: "It maps to WCAG 2.0 AA.",
    href: "/regulations",
    hrefLabel: "See regulations",
  },
  {
    term: "EN 301 549",
    definition: "The European accessibility standard for digital products and services.",
    why: "It is the EU's equivalent, also based on WCAG.",
    href: "/regulations",
    hrefLabel: "See regulations",
  },
];
