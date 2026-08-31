// Single source of truth for site navigation. The header (primary nav + account
// menu) and the footer (columns + legal strip) both consume SITE_SECTIONS so the
// two-tier grouping lives in one place. `label` values are i18n message keys
// resolved via useTranslations("nav").

export interface NavLink {
  href: string;
  label: string;
}

export interface SiteSection {
  label: string;
  children: NavLink[];
}

// Two-tier site structure. Five first-tier intents, each with related
// second-tier pages. "Scan your site" is deliberately NOT here — it is the
// header CTA. `understanding/[sc]` and per-SC remediation are deep-linked from
// `/standards` and findings, not navigation.
export const SITE_SECTIONS: SiteSection[] = [
  {
    label: "product",
    children: [
      { href: "/pricing", label: "plans" },
      { href: "/human-review", label: "humanReview" },
      { href: "/auditor", label: "auditor" },
      { href: "/api-keys", label: "apiAccess" },
      { href: "/roadmap", label: "roadmap" },
    ],
  },
  {
    label: "learn",
    children: [
      { href: "/training", label: "training" },
      { href: "/standards", label: "standards" },
      { href: "/what-is-accessibility", label: "whatIsAccessibility" },
      { href: "/glossary", label: "glossary" },
    ],
  },
  {
    label: "guides",
    children: [
      { href: "/guides", label: "guidesOverview" },
      { href: "/methodology", label: "methodology" },
      { href: "/remediation", label: "remediation" },
      { href: "/compliance", label: "compliance" },
      { href: "/faq", label: "faq" },
    ],
  },
  {
    label: "whoWeServe",
    children: [
      { href: "/for-government", label: "forGovernment" },
      { href: "/for-ngos", label: "forNgos" },
      { href: "/esg", label: "esgMapping" },
    ],
  },
  {
    label: "company",
    children: [
      { href: "/about", label: "whoWeAre" },
      { href: "/contact", label: "contact" },
      { href: "/donate", label: "donate" },
    ],
  },
];

// Signed-in account menu (shown under the account control). The assessment
// history ("My assessments") is surfaced here so returning users can reach it in
// one click; the Product tier still carries the auditor workspace and API access.
export const ACCOUNT_MENU: NavLink[] = [
  { href: "/auditor", label: "myAssessments" },
  { href: "/account", label: "account" },
  { href: "/settings", label: "settings" },
];

// The first-tier section label key that contains a given page path (for
// breadcrumbs). Returns the i18n key of the section, or undefined if the path
// is not a second-tier page.
export function tierOf(path: string): string | undefined {
  for (const section of SITE_SECTIONS) {
    if (section.children.some((child) => child.href === path)) return section.label;
  }
  return undefined;
}

export const LEGAL_LINKS: NavLink[] = [
  { href: "/terms", label: "terms" },
  { href: "/privacy", label: "privacy" },
  { href: "/sla", label: "serviceCommitment" },
  { href: "/refund", label: "refunds" },
  { href: "/accessibility-statement", label: "accessibilityStatement" },
];

// Flat primary navigation (visible, labelled, no dropdowns). "Assess" is the
// conversion path; the rest are the top-level content hubs.
export const PRIMARY_NAV: NavLink[] = [
  { href: "/assess", label: "assess" },
  { href: "/auditor", label: "auditor" },
  { href: "/standards", label: "standards" },
  { href: "/training", label: "training" },
  { href: "/guides", label: "guidesOverview" },
  { href: "/about", label: "whoWeAre" },
];

// i18n label key for each known page path, used to render related-links with a
// visible label (never "click here").
export const PAGE_LABELS: Record<string, string> = {
  "/assess": "assess",
  "/auditor": "auditor",
  "/learn": "learnBasics",
  "/standards": "standards",
  "/training": "training",
  "/guides": "guidesOverview",
  "/guide-articles": "guideArticles",
  "/who-we-serve": "whoWeServe",
  "/about": "whoWeAre",
  "/contact": "contact",
  "/legal": "legal",
  "/pricing": "plans",
  "/human-review": "humanReview",
  "/roadmap": "roadmap",
};

// Undirected related-content edges. The RELATED_LINKS map is derived from these
// so reciprocity holds by construction (if A→B then B→A).
const RELATED_EDGES: Array<[string, string]> = [
  ["/learn", "/standards"],
  ["/learn", "/guides"],
  ["/learn", "/training"],
  ["/learn", "/who-we-serve"],
  ["/standards", "/guides"],
  ["/standards", "/guide-articles"],
  ["/standards", "/training"],
  ["/training", "/about"],
  ["/guides", "/guide-articles"],
  ["/guides", "/who-we-serve"],
  ["/guides", "/human-review"],
  ["/guide-articles", "/who-we-serve"],
  ["/guide-articles", "/pricing"],
  ["/guide-articles", "/human-review"],
  ["/who-we-serve", "/about"],
  ["/who-we-serve", "/human-review"],
  ["/about", "/contact"],
  ["/contact", "/legal"],
  ["/contact", "/pricing"],
  ["/legal", "/about"],
  ["/legal", "/standards"],
  ["/pricing", "/human-review"],
  ["/pricing", "/who-we-serve"],
  ["/pricing", "/legal"],
  ["/human-review", "/assess"],
  ["/roadmap", "/about"],
  ["/roadmap", "/pricing"],
  ["/roadmap", "/contact"],
];

function buildRelatedLinks(edges: Array<[string, string]>): Record<string, string[]> {
  const map: Record<string, Set<string>> = {};
  const add = (a: string, b: string) => {
    (map[a] ??= new Set()).add(b);
    (map[b] ??= new Set()).add(a);
  };
  for (const [a, b] of edges) add(a, b);
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
}

// Reciprocal related-links map (path → related NavLinks).
export const RELATED_LINKS: Record<string, NavLink[]> = Object.fromEntries(
  Object.entries(buildRelatedLinks(RELATED_EDGES)).map(([path, related]) => [
    path,
    related.map((p) => ({ href: p, label: PAGE_LABELS[p] ?? "untitled" })),
  ]),
);
