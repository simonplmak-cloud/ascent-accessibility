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
      { href: "/guides/allow-scanner", label: "allowScanner" },
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
  { href: "/bot", label: "bot" },
];
