import type { Rule } from "../types";

export const perceivableRules: Rule[] = [
  {
    id: "image-alt",
    description: "Ensures <img> elements have alternate text or a decorative role",
    help: "Images must have alternate text",
    impact: "critical",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    matcher: "img",
    extract: (el) => ({ alt: el.getAttribute("alt"), role: el.getAttribute("role") }),
    checks: [
      {
        id: "alt-present-or-decorative",
        evaluate: (f) => {
          if (f.alt !== null) return { result: "pass" };
          if (f.role === "presentation" || f.role === "none") return { result: "pass" };
          return { result: "fail", failureSummary: "img element has no alt attribute" };
        },
      },
    ],
  },
  {
    id: "input-image-alt",
    description: "Ensures <input type=\"image\"> elements have alternate text",
    help: "Image buttons must have alternate text",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    matcher: "input[type='image']",
    extract: (el) => ({ alt: el.getAttribute("alt"), aria: el.getAttribute("aria-label") }),
    checks: [
      {
        id: "image-button-name",
        evaluate: (f) => {
          if ((f.alt as string)?.trim()) return { result: "pass" };
          if ((f.aria as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "input[type=image] has no text alternative" };
        },
      },
    ],
  },
  {
    id: "object-alt",
    description: "Ensures <object> elements have alternate text",
    help: "Object elements must have alternate text",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    matcher: "object",
    extract: (el) => ({
      text: (el.textContent || "").trim(),
      aria: el.getAttribute("aria-label"),
      title: el.getAttribute("title"),
    }),
    checks: [
      {
        id: "object-text-alternative",
        evaluate: (f) => {
          if (f.text) return { result: "pass" };
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "object element has no text alternative" };
        },
      },
    ],
  },
  {
    id: "svg-img-alt",
    description: "Ensures <svg> elements with an img role have an accessible name",
    help: "SVG images must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    matcher: "svg",
    extract: (el) => ({
      role: el.getAttribute("role"),
      aria: el.getAttribute("aria-label"),
      labelledby: el.getAttribute("aria-labelledby"),
      title: el.querySelector("title")?.textContent?.trim() ?? "",
    }),
    checks: [
      {
        id: "svg-img-name",
        evaluate: (f) => {
          const role = f.role as string | null;
          if (role !== "img" && role !== "graphics-document" && role !== "graphics-symbol") {
            return { result: "pass" };
          }
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if (f.labelledby) return { result: "pass" };
          if (f.title) return { result: "pass" };
          return { result: "fail", failureSummary: "svg with img role has no accessible name" };
        },
      },
    ],
  },
  {
    id: "video-caption",
    description: "Ensures <video> elements have captions",
    help: "Video elements must have captions",
    impact: "serious",
    tags: ["wcag2a", "wcag122"],
    wcagSc: ["1.2.2"],
    matcher: "video",
    extract: (el) => ({ hasTrack: !!el.querySelector("track[kind='captions'], track[kind='subtitles']") }),
    checks: [
      {
        id: "captions-track",
        evaluate: (f) =>
          f.hasTrack
            ? { result: "pass" }
            : { result: "fail", failureSummary: "video element has no captions track" },
      },
    ],
  },
  {
    id: "list",
    description: "Ensures that lists are structured correctly",
    help: "<ul> and <ol> must directly contain only <li> elements",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: "ul, ol",
    extract: (el) => ({
      children: Array.from(el.children)
        .filter((c) => c.tagName !== "SCRIPT" && c.tagName !== "TEMPLATE")
        .map((c) => c.tagName),
    }),
    checks: [
      {
        id: "list-only-li-children",
        evaluate: (f) => {
          const children = f.children as string[];
          if (children.length === 0) return { result: "pass" };
          const invalid = children.filter((t) => t !== "LI");
          return invalid.length > 0
            ? { result: "fail", failureSummary: "list contains non-li children" }
            : { result: "pass" };
        },
      },
    ],
  },
  {
    id: "listitem",
    description: "Ensures <li> elements are used semantically",
    help: "<li> elements must be contained in a <ul> or <ol>",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: "li",
    extract: (el) => ({
      parentTag: el.parentElement?.tagName.toLowerCase() ?? null,
      parentRole: el.parentElement?.getAttribute("role") ?? null,
    }),
    checks: [
      {
        id: "listitem-in-list",
        evaluate: (f) => {
          const tag = f.parentTag as string | null;
          if (tag === "ul" || tag === "ol") return { result: "pass" };
          const role = f.parentRole as string | null;
          if (role === "list" || role === "listbox" || role === "menu") return { result: "pass" };
          return { result: "fail", failureSummary: "li element is not inside a list" };
        },
      },
    ],
  },
  {
    id: "dlitem",
    description: "Ensures <dt> and <dd> elements are contained by a <dl>",
    help: "<dt> and <dd> must be inside a <dl>",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: "dt, dd",
    extract: (el) => ({ parentTag: el.parentElement?.tagName.toLowerCase() ?? null }),
    checks: [
      {
        id: "dlitem-in-dl",
        evaluate: (f) =>
          f.parentTag === "dl"
            ? { result: "pass" }
            : { result: "fail", failureSummary: "dt/dd element is not inside a dl" },
      },
    ],
  },
  {
    id: "definition-list",
    description: "Ensures <dl> elements are structured correctly",
    help: "<dl> must contain only <dt> and <dd> groups",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: "dl",
    extract: (el) => ({
      children: Array.from(el.children)
        .filter((c) => c.tagName !== "SCRIPT" && c.tagName !== "TEMPLATE")
        .map((c) => c.tagName),
    }),
    checks: [
      {
        id: "dl-valid-children",
        evaluate: (f) => {
          const children = f.children as string[];
          if (children.length === 0) return { result: "pass" };
          const valid = ["DT", "DD", "DIV"];
          return children.some((t) => !valid.includes(t))
            ? { result: "fail", failureSummary: "dl contains invalid children" }
            : { result: "pass" };
        },
      },
    ],
  },
  {
    id: "region",
    description: "Ensures all page content is contained by landmarks",
    help: "All page content should be contained by landmarks",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: null,
    extract: () => ({
      hasLandmark: !!document.querySelector(
        "main, nav, header, footer, aside, [role='main'], [role='navigation'], [role='banner'], [role='contentinfo'], [role='complementary'], [role='region']",
      ),
    }),
    checks: [
      {
        id: "landmark-present",
        evaluate: (f) =>
          f.hasLandmark
            ? { result: "pass" }
            : { result: "fail", failureSummary: "no landmark regions found" },
      },
    ],
  },
  {
    id: "landmark-unique",
    description: "Ensures landmarks are unique",
    help: "Repeated landmarks must have unique labels",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: null,
    extract: () => {
      const seen = new Map<string, number>();
      for (const el of Array.from(document.querySelectorAll("header, footer, nav, main, aside, [role]"))) {
        const role = el.getAttribute("role") || el.tagName.toLowerCase();
        if (["banner", "contentinfo", "navigation", "main", "complementary", "region", "header", "footer", "nav", "aside"].includes(role)) {
          const label = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "";
          const key = `${role}|${label}`;
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
      }
      let duplicate = "";
      for (const [key, count] of seen) {
        if (count > 1 && key.split("|")[1] === "") duplicate = key.split("|")[0]!;
      }
      return { duplicate };
    },
    checks: [
      {
        id: "landmark-unique-label",
        evaluate: (f) =>
          f.duplicate
            ? { result: "fail", failureSummary: `duplicate unlabelled landmark: ${f.duplicate}` }
            : { result: "pass" },
      },
    ],
  },
  {
    id: "heading-order",
    description: "Ensures the order of headings is semantically correct",
    help: "Heading levels should only increase by one",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    matcher: null,
    extract: () => ({
      levels: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) =>
        parseInt(h.tagName.charAt(1), 10),
      ),
    }),
    checks: [
      {
        id: "heading-order-no-skip",
        evaluate: (f) => {
          let prev = 0;
          for (const level of f.levels as number[]) {
            if (level - prev > 1) {
              return { result: "fail", failureSummary: `heading order skips from h${prev} to h${level}` };
            }
            if (level > prev) prev = level;
          }
          return { result: "pass" };
        },
      },
    ],
  },
  {
    id: "empty-heading",
    description: "Ensures headings have discernible text",
    help: "Headings must not be empty",
    impact: "minor",
    tags: ["wcag2aa", "wcag246"],
    wcagSc: ["2.4.6"],
    matcher: "h1, h2, h3, h4, h5, h6",
    extract: (el) => ({ text: (el.textContent || "").trim() }),
    checks: [
      {
        id: "heading-non-empty",
        evaluate: (f) =>
          f.text ? { result: "pass" } : { result: "fail", failureSummary: "heading element is empty" },
      },
    ],
  },
  {
    id: "meta-viewport",
    description: "Ensures <meta name=\"viewport\"> does not disable text scaling and zooming",
    help: "Zooming and scaling must not be disabled",
    impact: "serious",
    tags: ["wcag2aa", "wcag144"],
    wcagSc: ["1.4.4"],
    matcher: "meta[name='viewport']",
    extract: (el) => ({ content: el.getAttribute("content") || "" }),
    checks: [
      {
        id: "zoom-not-disabled",
        evaluate: (f) => {
          const content = f.content as string;
          if (/user-scalable\s*=\s*no/i.test(content)) {
            return { result: "fail", failureSummary: "user-scalable=no disables zoom" };
          }
          const max = /maximum-scale\s*=\s*([\d.]+)/i.exec(content);
          if (max && parseFloat(max[1]!) < 2) {
            return { result: "fail", failureSummary: "maximum-scale less than 2 disables zoom" };
          }
          return { result: "pass" };
        },
      },
    ],
  },
];
