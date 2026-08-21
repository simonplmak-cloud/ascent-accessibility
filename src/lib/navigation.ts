// Single source of truth for site navigation. The header (primary nav + account
// menu) and the footer (columns + legal strip) both consume this so grouping and
// ordering live in one place.

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
  { label: "Training", href: "/training" },
  { label: "Standards", href: "/standards" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    children: [
      { href: "/methodology", label: "Methodology" },
      { href: "/remediation", label: "Remediation" },
      { href: "/regulations", label: "Regulations" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    label: "Company",
    children: [
      { href: "/about", label: "About" },
      { href: "/human-review", label: "Human review" },
      { href: "/esg", label: "ESG mapping" },
      { href: "/validation", label: "Validation" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
];

// Signed-in account menu (shown under the account control).
export const ACCOUNT_MENU: NavLink[] = [
  { href: "/auditor", label: "Auditor" },
  { href: "/api-keys", label: "API access" },
  { href: "/account", label: "Account" },
];

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { href: "/assess", label: "Run a scan" },
      { href: "/training", label: "Training" },
      { href: "/auditor", label: "Auditor" },
      { href: "/api-keys", label: "API access" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/standards", label: "WCAG criteria" },
      { href: "/methodology", label: "Methodology" },
      { href: "/remediation", label: "Remediation" },
      { href: "/regulations", label: "Regulations" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/human-review", label: "Human review" },
      { href: "/esg", label: "ESG mapping" },
      { href: "/validation", label: "Validation" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/resources", label: "Resources" },
      { href: "/contact", label: "Contact" },
      { href: "/donate", label: "Donate" },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/sla", label: "Service commitment" },
  { href: "/refund", label: "Refunds" },
  { href: "/accessibility-statement", label: "Accessibility" },
];
