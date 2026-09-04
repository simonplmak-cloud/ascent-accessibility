import type { Finding } from "@/db/schema";
import type { Impact } from "@/lib/scoring";
import { getRecommendation } from "@/lib/recommendations";
import { getSc } from "@/lib/standards/wcag-sc";

// Cross-page structural analysis. The engine evaluates per-page, so criteria
// that are only decidable across the whole crawl (multiple ways to a page,
// consistent navigation/identification, presence of breadcrumbs/help) are
// resolved here deterministically from the per-page structures collected during
// the crawl. Honest: only *positive* observations resolve — a mechanism found
// → Pass, an inconsistency observed → Fail. "Absence" that cannot be positively
// confirmed is left for the agentic backstop (never a speculative fail).

export interface PageStructure {
  url: string;
  navLabels: string[];
  headerText: string;
  footerText: string;
  linkPairs: Array<{ href: string; label: string }>;
  hasSearch: boolean;
  hasBreadcrumb: boolean;
  hasHelpLink: boolean;
  hasSitemapLink: boolean;
  formFieldLabels: string[];
}

// Runs in-page via scanner.evaluate — browser globals only, JSON-serializable.
export function extractPageStructure(): PageStructure {
  const name = (el: Element | null): string =>
    el ? (el.getAttribute("aria-label") || (el.textContent || "").trim()).slice(0, 120) : "";

  const navEl = document.querySelector<HTMLElement>("nav, [role='navigation']");
  const navLabels = navEl
    ? Array.from(navEl.querySelectorAll<HTMLAnchorElement>("a[href]"))
        .map((a) => name(a))
        .filter(Boolean)
    : [];

  const headerEl = document.querySelector<HTMLElement>("header, [role='banner']");
  const footerEl = document.querySelector<HTMLElement>("footer, [role='contentinfo']");

  const linkPairs = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
    .map((a) => ({ href: (a.getAttribute("href") || "").slice(0, 200), label: name(a) }))
    .filter((p) => p.label);

  const hasSearch = !!document.querySelector(
    "input[type='search'], [role='search'], form[role='search'], input[aria-label*='search' i], input[name*='search' i]",
  );
  const hasBreadcrumb = !!document.querySelector(
    "[aria-label*='breadcrumb' i], nav[aria-label*='breadcrumb' i], .breadcrumb, ol[class*='breadcrumb'], ul[class*='breadcrumb']",
  );
  const helpRe = /help|support|contact|assistance/i;
  const hasHelpLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).some((a) =>
    helpRe.test((a.getAttribute("aria-label") || a.textContent || "")),
  );
  const hasSitemapLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).some((a) =>
    /sitemap/i.test((a.getAttribute("href") || "") + (a.getAttribute("aria-label") || a.textContent || "")),
  );
  const formFieldLabels = Array.from(
    document.querySelectorAll<HTMLElement>("input:not([type='hidden']), select, textarea"),
  )
    .map((el) => {
      const field = el as HTMLInputElement;
      return (
        field.getAttribute("aria-label") ||
        (field.labels && field.labels[0] ? field.labels[0].textContent : "") ||
        ""
      )
        .trim()
        .slice(0, 80);
    })
    .filter(Boolean);

  return {
    url: location.href,
    navLabels,
    headerText: name(headerEl),
    footerText: name(footerEl),
    linkPairs,
    hasSearch,
    hasBreadcrumb,
    hasHelpLink,
    hasSitemapLink,
    formFieldLabels,
  };
}

export interface CrossPageResult {
  passes: string[];
  findings: Finding[];
}

function crossFinding(
  ruleId: string,
  impact: Impact,
  description: string,
  wcagSc: string,
  help: string,
  recommendation: string,
): Finding {
  const sc = getSc(wcagSc);
  return {
    ruleId,
    impact,
    description,
    pageUrl: "",
    elementCount: 1,
    recommendation,
    help,
    helpUrl: sc ? `https://www.w3.org/WAI/WCAG22/Understanding/${wcagSc}.html` : "",
    wcagSc: [wcagSc],
    wcagLevel: sc?.level ?? null,
    scTitle: sc?.title ?? wcagSc,
    confidence: "single-source",
    sources: [{ tool: "engine", ruleId, impact, message: description }],
    instances: [{ target: "", html: "", failureSummary: description, evidenceId: null }],
  };
}

export function analyzeCrossPage(structures: PageStructure[]): CrossPageResult {
  const passes = new Set<string>();
  const findings: Finding[] = [];
  const n = structures.length;

  // 2.4.5 Multiple ways (AA) — more than one way to locate a page.
  if (n <= 1) {
    passes.add("2.4.5"); // a single page is trivially locatable
  } else {
    const hasNav = structures.filter((s) => s.navLabels.length > 0).length >= Math.ceil(n * 0.5);
    const ways = [hasNav, structures.some((s) => s.hasSearch), structures.some((s) => s.hasSitemapLink)].filter(Boolean).length;
    if (ways >= 2) passes.add("2.4.5");
    // fewer than two ways across the crawl is a positive observation of failure
    else if (n >= 2) {
      findings.push(
        crossFinding(
          "cross-multiple-ways",
          "serious",
          "Only one way (or no way) to locate pages across the site was found.",
          "2.4.5",
          "More than one way must be available to locate a page",
          "Add a second way to locate pages — e.g. a search box, a sitemap, or a link to all pages.",
        ),
      );
    }
  }

  // 2.4.8 Location (AAA) — breadcrumb (or equivalent) on most pages.
  if (n > 0 && structures.filter((s) => s.hasBreadcrumb).length >= Math.ceil(n * 0.5)) {
    passes.add("2.4.8");
  }

  // 3.3.5 Help (AAA) — a help mechanism on most pages.
  if (n > 0 && structures.filter((s) => s.hasHelpLink).length >= Math.ceil(n * 0.5)) {
    passes.add("3.3.5");
  }

  // 3.2.3 Consistent navigation (AA) — nav order/labels stable across pages.
  if (n <= 1) {
    passes.add("3.2.3");
  } else {
    const signatures = structures
      .filter((s) => s.navLabels.length > 0)
      .map((s) => s.navLabels.join("|"));
    const unique = new Set(signatures);
    if (unique.size <= 1) {
      passes.add("3.2.3");
    } else {
      findings.push(
        crossFinding(
          "cross-consistent-nav",
          "serious",
          "Navigation links differ in order or wording across pages.",
          "3.2.3",
          "Navigation must be presented in the same relative order on each page",
          "Keep the same navigation links, in the same order, on every page.",
        ),
      );
    }
  }

  // 3.2.4 Consistent identification (AA) — same target always named the same.
  if (n <= 1) {
    passes.add("3.2.4");
  } else {
    const hrefLabels = new Map<string, Set<string>>();
    for (const s of structures) {
      for (const p of s.linkPairs) {
        const set = hrefLabels.get(p.href) ?? new Set<string>();
        set.add(p.label);
        hrefLabels.set(p.href, set);
      }
    }
    const inconsistent = [...hrefLabels.values()].filter((labels) => labels.size > 1);
    if (inconsistent.length === 0) {
      passes.add("3.2.4");
    } else {
      findings.push(
        crossFinding(
          "cross-consistent-identification",
          "serious",
          "Components with the same destination are labelled differently across pages.",
          "3.2.4",
          "Components with the same function must be identified consistently",
          "Use one consistent label for components that go to the same destination.",
        ),
      );
    }
  }

  return { passes: [...passes], findings };
}
