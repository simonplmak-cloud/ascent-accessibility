// Single source of truth for site navigation. The header (primary nav + account
// menu) and the footer (columns + legal strip) both consume this so grouping and
// ordering live in one place. `label` values are i18n message keys resolved via
// useTranslations("nav") in the header/footer components.

export interface NavLink {
  href: string;
  label: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavLink[];
}

// Desktop primary navigation — 5 categories (count categories, not utilities).
export const PRIMARY_NAV: NavItem[] = [
  { label: "training", href: "/training" },
  { label: "standards", href: "/standards" },
  { label: "plans", href: "/pricing" },
  {
    label: "guides",
    children: [
      { href: "/methodology", label: "methodology" },
      { href: "/remediation", label: "remediation" },
      { href: "/regulations", label: "regulations" },
      { href: "/faq", label: "faq" },
    ],
  },
  {
    label: "company",
    children: [
      { href: "/about", label: "about" },
      { href: "/for-government", label: "forGovernment" },
      { href: "/for-ngos", label: "forNgos" },
      { href: "/human-review", label: "humanReview" },
      { href: "/esg", label: "esgMapping" },
      { href: "/validation", label: "validation" },
      { href: "/roadmap", label: "roadmap" },
    ],
  },
];

// Signed-in account menu (shown under the account control).
export const ACCOUNT_MENU: NavLink[] = [
  { href: "/auditor", label: "auditor" },
  { href: "/api-keys", label: "apiAccess" },
  { href: "/account", label: "account" },
];

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "tool",
    links: [
      { href: "/assess", label: "scanYourSite" },
      { href: "/training", label: "training" },
      { href: "/auditor", label: "auditor" },
      { href: "/api-keys", label: "apiAccess" },
      { href: "/pricing", label: "plans" },
    ],
  },
  {
    heading: "learn",
    links: [
      { href: "/what-is-accessibility", label: "whatIsAccessibility" },
      { href: "/glossary", label: "glossary" },
      { href: "/guides", label: "guides" },
      { href: "/standards", label: "standards" },
      { href: "/methodology", label: "methodology" },
      { href: "/remediation", label: "remediation" },
      { href: "/regulations", label: "regulations" },
    ],
  },
  {
    heading: "company",
    links: [
      { href: "/about", label: "about" },
      { href: "/for-government", label: "forGovernment" },
      { href: "/for-ngos", label: "forNgos" },
      { href: "/human-review", label: "humanReview" },
      { href: "/esg", label: "esgMapping" },
      { href: "/validation", label: "validation" },
      { href: "/roadmap", label: "roadmap" },
    ],
  },
  {
    heading: "support",
    links: [
      { href: "/faq", label: "faq" },
      { href: "/resources", label: "resources" },
      { href: "/contact", label: "contact" },
      { href: "/donate", label: "donate" },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { href: "/terms", label: "terms" },
  { href: "/privacy", label: "privacy" },
  { href: "/sla", label: "serviceCommitment" },
  { href: "/refund", label: "refunds" },
  { href: "/accessibility-statement", label: "accessibilityStatement" },
];
