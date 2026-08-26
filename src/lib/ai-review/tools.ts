// Browser tools exposed to the AI review model via OpenAI function-calling.
// Each tool has a JSON-schema definition (sent to the model) and an in-page
// implementation (run via `page.evaluate`). Impls use only browser globals and
// return JSON-serializable values.

export interface AiToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export type ToolImpl = (args: Record<string, unknown>) => unknown;

// In-page implementations. Serialized by Playwright's page.evaluate.
export const AI_TOOL_IMPL: Record<string, ToolImpl> = {
  get_a11y_tree: () => {
    const out: { role: string; name: string; level?: number }[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
      const tag = el.tagName.toLowerCase();
      const implicit =
        tag === "nav" ? "navigation"
        : tag === "main" ? "main"
        : tag === "header" ? "banner"
        : tag === "footer" ? "contentinfo"
        : tag === "aside" ? "complementary"
        : tag === "form" ? "form"
        : tag === "img" ? "img"
        : tag === "a" ? "link"
        : tag === "button" ? "button"
        : /^h[1-6]$/.test(tag) ? "heading"
        : null;
      const role = el.getAttribute("role") || implicit;
      if (!role) continue;
      const name = (el.getAttribute("aria-label") || (el.textContent || "").trim().slice(0, 80) || "").slice(0, 120);
      const h = /^h([1-6])$/.exec(tag);
      out.push({ role, name, level: h ? parseInt(h[1]!, 10) : undefined });
    }
    return out.slice(0, 250);
  },

  inspect_element: (args) => {
    const sel = String(args.selector ?? "body");
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return {
      found: true,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      ariaLabel: el.getAttribute("aria-label"),
      ariaLabelledby: el.getAttribute("aria-labelledby"),
      ariaLive: el.getAttribute("aria-live"),
      ariaCurrent: el.getAttribute("aria-current"),
      ariaExpanded: el.getAttribute("aria-expanded"),
      text: (el.textContent || "").trim().slice(0, 300),
      html: (el.outerHTML || "").slice(0, 500),
      display: cs.display,
      visibility: cs.visibility,
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
    };
  },

  query_all: (args) => {
    const sel = String(args.selector ?? "*");
    const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
    return els.slice(0, 50).map((el) => ({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      text: (el.textContent || "").trim().slice(0, 100),
      ariaLabel: el.getAttribute("aria-label"),
      tabindex: el.getAttribute("tabindex"),
      disabled: el.hasAttribute("disabled"),
    }));
  },

  check_contrast: (args) => {
    const sel = String(args.selector ?? "body");
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return { found: false };
    const parse = (c: string): [number, number, number, number] | null => {
      const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
      return m ? [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1] : null;
    };
    const lum = (r: number, g: number, b: number) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    let bg: [number, number, number, number] | null = null;
    let node: Element | null = el;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c[3] > 0) { bg = c; break; }
      node = node.parentElement;
    }
    if (!fg || !bg) return { found: true, computable: false };
    const ratio = (Math.max(lum(fg[0], fg[1], fg[2]), lum(bg[0], bg[1], bg[2])) + 0.05) / (Math.min(lum(fg[0], fg[1], fg[2]), lum(bg[0], bg[1], bg[2])) + 0.05);
    return { found: true, ratio: Number(ratio.toFixed(2)), fontSize: parseFloat(cs.fontSize || "0"), fontWeight: parseInt(cs.fontWeight || "400", 10) };
  },

  get_images_and_alt: () => {
    return Array.from(document.querySelectorAll<HTMLElement>("img, svg, [role='img'], area")).slice(0, 50).map((el) => ({
      tag: el.tagName.toLowerCase(),
      alt: el.getAttribute("alt"),
      ariaLabel: el.getAttribute("aria-label"),
      role: el.getAttribute("role"),
      src: (el.getAttribute("src") || "").slice(0, 80),
    }));
  },

  get_links: () => {
    return Array.from(document.querySelectorAll<HTMLElement>("a[href]")).slice(0, 80).map((el) => ({
      text: (el.textContent || "").trim().slice(0, 80),
      href: (el.getAttribute("href") || "").slice(0, 120),
      ariaLabel: el.getAttribute("aria-label"),
      ariaCurrent: el.getAttribute("aria-current"),
    }));
  },

  get_headings: () => {
    return Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")).map((el) => ({
      level: parseInt(el.tagName.charAt(1), 10),
      text: (el.textContent || "").trim().slice(0, 100),
    }));
  },

  get_reading_order: () => {
    const blocks: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6,p,li,button,a,label,th,td"))) {
      const t = (el.textContent || "").trim();
      if (t) blocks.push(t.slice(0, 100));
    }
    return blocks.slice(0, 120);
  },

  trigger_focus: (args) => {
    const sel = String(args.selector ?? "a[href], button, input, select, textarea");
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return { found: false };
    el.focus();
    const active = document.activeElement as HTMLElement | null;
    const cs = active ? getComputedStyle(active) : null;
    return {
      found: true,
      focusedTag: active?.tagName.toLowerCase(),
      outlineStyle: cs?.outlineStyle,
      outlineWidth: cs?.outlineWidth,
      outlineColor: cs?.outlineColor,
    };
  },

  trigger_hover: (args) => {
    const sel = String(args.selector ?? "a[href], button");
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return { found: false };
    for (const type of ["mouseover", "mouseenter", "focus"]) {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    return { found: true, text: (el.textContent || "").trim().slice(0, 100) };
  },

  trigger_input_and_errors: (args) => {
    const sel = String(args.selector ?? "input, select, textarea");
    const el = document.querySelector<HTMLInputElement>(sel);
    if (!el) return { found: false };
    if ("value" in el) el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    const errors = Array.from(document.querySelectorAll<HTMLElement>("[role='alert'], [aria-invalid='true'], .error, [class*='error']")).slice(0, 10).map((e) => (e.textContent || "").trim().slice(0, 120));
    return { found: true, ariaInvalid: el.getAttribute("aria-invalid"), errorMessages: errors };
  },

  trigger_keyboard_traversal: () => {
    const focusable =
      "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']), [contenteditable='true']";
    const els = Array.from(document.querySelectorAll<HTMLElement>(focusable));
    const order = els.slice(0, 60).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 60),
        tabindex: el.getAttribute("tabindex"),
        visible: cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0,
      };
    });
    // Click targets that are not natively focusable and lack tabindex — a signal
    // for 2.1.1 (no keyboard equivalent for pointer-only controls).
    const clickOnly = els.filter((el) => {
      const tag = el.tagName.toLowerCase();
      const nativelyFocusable = /^(a|button|input|select|textarea)$/.test(tag) || el.hasAttribute("contenteditable");
      return !nativelyFocusable && el.getAttribute("tabindex") === null;
    }).length;
    const positiveTabindex = els.filter((el) => {
      const t = el.getAttribute("tabindex");
      return t !== null && Number.parseInt(t, 10) > 0;
    }).length;
    return { focusableCount: els.length, order, clickOnly, positiveTabindex };
  },
};

// OpenAI function-calling definitions (JSON Schema).
export const AI_TOOLS: AiToolDef[] = [
  {
    name: "get_a11y_tree",
    description: "Get the page's accessible roles and names (headings, landmarks, links, buttons, images, forms, live regions).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "inspect_element",
    description: "Inspect a matched element: tag, role, ARIA attributes, computed styles (display/visibility/outline), text, and bounding rect.",
    parameters: { type: "object", properties: { selector: { type: "string", description: "CSS selector" } }, required: ["selector"] },
  },
  {
    name: "query_all",
    description: "List elements matching a CSS selector (tag, role, text, aria-label, tabindex, disabled).",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
  },
  {
    name: "check_contrast",
    description: "Compute the text/background contrast ratio for a matched element (and its font size/weight).",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
  },
  {
    name: "get_images_and_alt",
    description: "List images (img/svg/[role=img]/area) with their alt / aria-label / role.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_links",
    description: "List links with their text, href, aria-label, and aria-current.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_headings",
    description: "List headings with level and text.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_reading_order",
    description: "Get the DOM text-block order (headings, paragraphs, list items, links, buttons, labels).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "trigger_focus",
    description: "Focus an interactive element and report the focused element's outline (for focus-appearance criteria).",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
  },
  {
    name: "trigger_hover",
    description: "Dispatch mouseover/mouseenter/focus on an element (for content-on-hover/focus criteria).",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
  },
  {
    name: "trigger_input_and_errors",
    description: "Clear a form input, trigger input/change/blur, and collect visible error messages / aria-invalid (for error-identification criteria).",
    parameters: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] },
  },
  {
    name: "trigger_keyboard_traversal",
    description: "Enumerate the keyboard focus order and flag focusability issues (non-focusable click targets, positive tabindex) for keyboard/focus-context criteria.",
    parameters: { type: "object", properties: {} },
  },
];

// Server-side runner: binds a tool name to a `page.evaluate`-backed executor.
export interface ToolRunner {
  run(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export function toolImplByName(name: string): ToolImpl | undefined {
  return AI_TOOL_IMPL[name];
}
