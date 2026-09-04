import { describe, expect, it } from "vitest";
import { Window } from "happy-dom";
import { ALL_RULES } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";

interface EngineResult {
  violations: { id: string; failureSummary?: string }[];
  passes: { id: string }[];
  incomplete: { id: string }[];
  inapplicable: { id: string }[];
  errors?: { ruleId: string; phase: string; message: string }[];
}

const ALL_TAGS = Array.from(new Set(ALL_RULES.flatMap((r) => r.tags)));

function runEngine(html: string, tags: string[] = ALL_TAGS): EngineResult {
  const window = new Window({ url: "https://example.com/" });
  window.document.write(html);
  window.eval(buildEngineSource(ALL_RULES));
  const engine = (window as unknown as { __apfEngine: { run: (t: string[]) => EngineResult } })
    .__apfEngine;
  return engine.run(tags);
}

function violations(result: EngineResult, id: string) {
  return result.violations.filter((v) => v.id === id);
}
function passes(result: EngineResult, id: string) {
  return result.passes.some((p) => p.id === id);
}

const RICH_FIXTURE = `<!doctype html><html lang="en"><head>
<title>Fixture</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head><body>
<main>
<h1>Heading</h1><h2>Sub</h2>
<a href="/x">Home</a>
<nav><a href="/a">A</a><a href="/b">B</a></nav>
<img src="x.png" alt="Logo">
<button>Save</button>
<ul><li>one</li><li>two</li></ul>
<form><label for="email">Email</label><input id="email" type="text" autocomplete="email"></form>
<video controls></video>
<table><tr><td>cell</td></tr></table>
<iframe title="frame"></iframe>
</main></body></html>`;

describe("engine rules (happy-dom harness)", () => {
  it("every rule runs in-page without throwing (self-contained, no closure capture)", () => {
    const result = runEngine(RICH_FIXTURE);
    const errors = result.errors ?? [];
    expect(errors).toEqual([]);
    // Every rule must produce some verdict (violation/pass/incomplete/inapplicable).
    const seen = new Set([
      ...result.violations.map((v) => v.id),
      ...result.passes.map((p) => p.id),
      ...result.incomplete.map((p) => p.id),
      ...result.inapplicable.map((p) => p.id),
    ]);
    for (const rule of ALL_RULES) {
      expect(seen.has(rule.id), `rule ${rule.id} produced no verdict`).toBe(true);
    }
  });

  it("image-alt: flags an img without alt, passes a decorative image", () => {
    const fail = runEngine("<img src='x.png'>");
    expect(violations(fail, "image-alt").length).toBe(1);

    const pass = runEngine("<img src='x.png' role='presentation'>");
    expect(passes(pass, "image-alt")).toBe(true);
  });

  it("html-has-lang: requires a lang attribute", () => {
    expect(passes(runEngine("<html lang='en'><body>x</body></html>"), "html-has-lang")).toBe(true);
    expect(violations(runEngine("<html><body>x</body></html>"), "html-has-lang").length).toBe(1);
  });

  it("button-name: flags an empty button", () => {
    expect(passes(runEngine("<button>Go</button>"), "button-name")).toBe(true);
    expect(violations(runEngine("<button></button>"), "button-name").length).toBe(1);
  });

  it("list: flags non-li children", () => {
    expect(passes(runEngine("<ul><li>a</li></ul>"), "list")).toBe(true);
    expect(violations(runEngine("<ul><div>a</div></ul>"), "list").length).toBe(1);
  });

  it("heading-order: flags a skipped heading level", () => {
    expect(passes(runEngine("<h1>a</h1><h2>b</h2>"), "heading-order")).toBe(true);
    expect(violations(runEngine("<h1>a</h1><h3>b</h3>"), "heading-order").length).toBe(1);
  });

  it("link-name: flags a link with no discernible text", () => {
    expect(passes(runEngine("<a href='/x'>text</a>"), "link-name")).toBe(true);
    expect(violations(runEngine("<a href='/x'></a>"), "link-name").length).toBe(1);
  });

  it("tabindex: flags a positive tabindex", () => {
    expect(passes(runEngine("<button tabindex='0'>x</button>"), "tabindex")).toBe(true);
    expect(violations(runEngine("<button tabindex='3'>x</button>"), "tabindex").length).toBe(1);
  });

  it("meta-viewport: flags user-scalable=no", () => {
    const bad = runEngine("<meta name='viewport' content='width=device-width, user-scalable=no'>");
    expect(violations(bad, "meta-viewport").length).toBe(1);
  });

  it("autocomplete-valid: flags an invalid autocomplete value", () => {
    expect(passes(runEngine("<input autocomplete='email'>"), "autocomplete-valid")).toBe(true);
    expect(violations(runEngine("<input autocomplete='bogus-value'>"), "autocomplete-valid").length).toBe(1);
  });

  it("duplicate-id: flags a repeated id", () => {
    expect(violations(runEngine("<div id='a'></div><span id='a'></span>"), "duplicate-id").length).toBe(1);
    expect(passes(runEngine("<div id='a'></div><span id='b'></span>"), "duplicate-id")).toBe(true);
  });

  it("click-events-have-key-events: flags a div[onclick] without tabindex", () => {
    const fail = runEngine("<div onclick='x()'>click me</div>");
    expect(violations(fail, "click-events-have-key-events").length).toBe(1);

    const pass = runEngine("<div onclick='x()' tabindex='0'>click me</div>");
    expect(passes(pass, "click-events-have-key-events")).toBe(true);
  });

  it("pointer-cancellation: flags a down handler without an up/click handler", () => {
    expect(violations(runEngine("<div onmousedown='x()'></div>"), "pointer-cancellation").length).toBe(1);
    expect(passes(runEngine("<div onmousedown='x()' onclick='y()'></div>"), "pointer-cancellation")).toBe(true);
  });

  it("dragging-movements: flags a draggable element without an alternative", () => {
    expect(violations(runEngine("<div draggable='true'></div>"), "dragging-movements").length).toBe(1);
    expect(passes(runEngine("<div draggable='true' onkeydown='x()'></div>"), "dragging-movements")).toBe(true);
  });

  it("color-contrast: incomplete when colors are not computable (no crash)", () => {
    // happy-dom has no cascade, so fg/bg are not computable — the rule must
    // degrade to "incomplete", never throw.
    const result = runEngine("<p>text</p>");
    expect(result.errors ?? []).toEqual([]);
    expect(result.incomplete.some((i) => i.id === "color-contrast")).toBe(true);
  });
});
