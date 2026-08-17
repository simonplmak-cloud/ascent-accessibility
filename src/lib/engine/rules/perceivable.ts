import type { Rule } from "../types";

export const perceivableRules: Rule[] = [
  {
    id: "image-alt",
    description: "Ensures <img> elements have alternate text or a role of none or presentation",
    help: "Images must have alternate text",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    selector: "img",
    check: (el) => {
      const alt = el.getAttribute("alt");
      if (alt === null) {
        const role = el.getAttribute("role");
        if (role === "presentation" || role === "none") return { result: "pass" };
        return { result: "fail", failureSummary: "img element has no alt attribute" };
      }
      return { result: "pass" };
    },
  },
  {
    id: "input-image-alt",
    description: "Ensures <input type=\"image\"> elements have alternate text",
    help: "Image buttons must have alternate text",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    selector: "input[type='image']",
    check: (el) => {
      const alt = el.getAttribute("alt");
      if (alt && alt.trim()) return { result: "pass" };
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "input[type=image] has no text alternative" };
    },
  },
  {
    id: "object-alt",
    description: "Ensures <object> elements have alternate text",
    help: "Object elements must have alternate text",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    selector: "object",
    check: (el) => {
      if ((el.textContent || "").trim()) return { result: "pass" };
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "object element has no text alternative" };
    },
  },
  {
    id: "svg-img-alt",
    description: "Ensures <svg> elements with an img role have an accessible name",
    help: "SVG images must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag111"],
    wcagSc: ["1.1.1"],
    selector: "svg",
    check: (el) => {
      const role = el.getAttribute("role");
      if (role !== "img" && role !== "graphics-document" && role !== "graphics-symbol") {
        return { result: "pass" };
      }
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) return { result: "pass" };
      const title = el.querySelector("title");
      if (title && (title.textContent || "").trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "svg with img role has no accessible name" };
    },
  },
  {
    id: "video-caption",
    description: "Ensures <video> elements have captions",
    help: "Video elements must have captions",
    impact: "serious",
    tags: ["wcag2a", "wcag122"],
    wcagSc: ["1.2.2"],
    selector: "video",
    check: (el) => {
      const track = el.querySelector("track[kind='captions'], track[kind='subtitles']");
      if (track) return { result: "pass" };
      return { result: "fail", failureSummary: "video element has no captions track" };
    },
  },
  {
    id: "list",
    description: "Ensures that lists are structured correctly",
    help: "<ul> and <ol> must directly contain only <li> elements",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: "ul, ol",
    check: (el) => {
      const children = Array.from(el.children).filter(
        (c) => c.tagName !== "SCRIPT" && c.tagName !== "TEMPLATE",
      );
      if (children.length === 0) return { result: "pass" };
      const invalid = children.filter((c) => c.tagName !== "LI");
      if (invalid.length > 0) {
        return { result: "fail", failureSummary: "list contains non-li children" };
      }
      return { result: "pass" };
    },
  },
  {
    id: "listitem",
    description: "Ensures <li> elements are used semantically",
    help: "<li> elements must be contained in a <ul> or <ol>",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: "li",
    check: (el) => {
      const parent = el.parentElement;
      if (parent && (parent.tagName === "UL" || parent.tagName === "OL")) {
        return { result: "pass" };
      }
      const role = parent?.getAttribute("role");
      if (role === "list" || role === "listbox" || role === "menu") return { result: "pass" };
      return { result: "fail", failureSummary: "li element is not inside a list" };
    },
  },
  {
    id: "dlitem",
    description: "Ensures <dt> and <dd> elements are contained by a <dl>",
    help: "<dt> and <dd> must be inside a <dl>",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: "dt, dd",
    check: (el) => {
      const parent = el.parentElement;
      if (parent && parent.tagName === "DL") return { result: "pass" };
      return { result: "fail", failureSummary: "dt/dd element is not inside a dl" };
    },
  },
  {
    id: "definition-list",
    description: "Ensures <dl> elements are structured correctly",
    help: "<dl> must contain only <dt> and <dd> groups",
    impact: "moderate",
    tags: ["wcag2a", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: "dl",
    check: (el) => {
      const children = Array.from(el.children).filter(
        (c) => c.tagName !== "SCRIPT" && c.tagName !== "TEMPLATE",
      );
      if (children.length === 0) return { result: "pass" };
      const valid = children.filter((c) => c.tagName === "DT" || c.tagName === "DD" || c.tagName === "DIV");
      if (valid.length !== children.length) {
        return { result: "fail", failureSummary: "dl contains invalid children" };
      }
      return { result: "pass" };
    },
  },
  {
    id: "region",
    description: "Ensures all page content is contained by landmarks",
    help: "All page content should be contained by landmarks",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: null,
    check: () => {
      const landmark = document.querySelector(
        "main, nav, header, footer, aside, [role='main'], [role='navigation'], [role='banner'], [role='contentinfo'], [role='complementary'], [role='region']",
      );
      if (!landmark) return { result: "fail", failureSummary: "no landmark regions found" };
      return { result: "pass" };
    },
  },
  {
    id: "landmark-unique",
    description: "Ensures landmarks are unique",
    help: "Repeated landmarks must have unique labels",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: null,
    check: () => {
      const roles = new Map<string, number>();
      const els = document.querySelectorAll("header, footer, nav, main, aside, [role]");
      for (const el of Array.from(els)) {
        const role = el.getAttribute("role") || el.tagName.toLowerCase();
        if (["banner", "contentinfo", "navigation", "main", "complementary", "region", "header", "footer", "nav", "aside"].includes(role)) {
          const label = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "";
          const key = role + "|" + label;
          roles.set(key, (roles.get(key) || 0) + 1);
        }
      }
      for (const [key, count] of roles) {
        if (count > 1 && key.split("|")[1] === "") {
          return { result: "fail", failureSummary: "duplicate unlabelled landmark: " + key.split("|")[0] };
        }
      }
      return { result: "pass" };
    },
  },
  {
    id: "heading-order",
    description: "Ensures the order of headings is semantically correct",
    help: "Heading levels should only increase by one",
    impact: "moderate",
    tags: ["wcag2aa", "wcag131"],
    wcagSc: ["1.3.1"],
    selector: null,
    check: () => {
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      let prev = 0;
      for (const h of headings) {
        const level = parseInt(h.tagName.charAt(1), 10);
        if (level - prev > 1) {
          return { result: "fail", failureSummary: `heading order skips from h${prev} to h${level}` };
        }
        if (level > prev) prev = level;
      }
      return { result: "pass" };
    },
  },
  {
    id: "empty-heading",
    description: "Ensures headings have discernible text",
    help: "Headings must not be empty",
    impact: "minor",
    tags: ["wcag2aa", "wcag246"],
    wcagSc: ["2.4.6"],
    selector: "h1, h2, h3, h4, h5, h6",
    check: (el) => {
      if ((el.textContent || "").trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "heading element is empty" };
    },
  },
  {
    id: "meta-viewport",
    description: "Ensures <meta name=\"viewport\"> does not disable text scaling and zooming",
    help: "Zooming and scaling must not be disabled",
    impact: "serious",
    tags: ["wcag2aa", "wcag144"],
    wcagSc: ["1.4.4"],
    selector: "meta[name='viewport']",
    check: (el) => {
      const content = el.getAttribute("content") || "";
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
];
