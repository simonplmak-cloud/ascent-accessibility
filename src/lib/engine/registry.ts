import type { Rule } from "./types";

// In-page rule evaluation source. Rules are self-contained (extract uses only
// browser globals; checks are pure over facts), so `.toString()` inlines them
// safely into this script.
const FEATURES_SOURCE = `
var __apfHas = function (doc, sel) {
  try { return !!doc.querySelector(sel); } catch (e) { return false; }
};
var __apfFeatures = function (doc) {
  return {
    hasContent: !!(doc.body && (doc.body.textContent || "").trim().length > 0),
    hasVideo: __apfHas(doc, "video"),
    hasAudio: __apfHas(doc, "audio"),
    hasVideoCaptions: __apfHas(doc, "video track[kind='captions'], video track[kind='subtitles']"),
    hasAudioDescription: __apfHas(doc, "video track[kind='descriptions']"),
    hasForms: __apfHas(doc, "form, input, select, textarea"),
    hasTables: __apfHas(doc, "table"),
    hasIframes: __apfHas(doc, "iframe"),
    hasMetaRefresh: __apfHas(doc, "meta[http-equiv='refresh' i]"),
    hasMarquee: __apfHas(doc, "marquee, blink"),
    hasAccesskey: __apfHas(doc, "[accesskey]"),
    hasPositiveTabindex: Array.prototype.slice.call(doc.querySelectorAll("[tabindex]")).some(function (el) {
      return parseInt(el.getAttribute("tabindex") || "0", 10) > 0;
    }),
    hasDragHandlers: __apfHas(doc, "[draggable='true'], [ondrop], [ondragstart], [ondragover]"),
    hasTouchHandlers: __apfHas(doc, "[ontouchstart], [ontouchmove], [ontouchend], [ongesturestart]"),
    hasImages: __apfHas(doc, "img, svg"),
    hasBackgroundImages: __apfHas(doc, "[style*='background-image'], [style*='background:url']"),
    hasAnimatedContent: __apfHas(doc, "[style*='animation'], [style*='transition'], marquee"),
    hasAutoplay: __apfHas(doc, "video[autoplay], audio[autoplay]"),
    hasLiveContent: __apfHas(doc, "[aria-live]"),
    hasLinks: __apfHas(doc, "a[href]"),
    hasHeadings: __apfHas(doc, "h1,h2,h3,h4,h5,h6"),
    hasLandmarks: __apfHas(doc, "main, nav, header, footer, [role='main']"),
    hasLang: !!doc.documentElement.lang,
    hasInteractive: __apfHas(doc, "a[href], button, input, select, textarea, [role='button']"),
    hasTimeLimit: __apfHas(doc, "meta[http-equiv='refresh' i]")
  };
};
var __apfMediaUrls = function (doc) {
  var out = [];
  var seen = {};
  var els = doc.querySelectorAll("audio[src], video[src], source[src]");
  for (var i = 0; i < els.length && out.length < 10; i++) {
    var src = els[i].getAttribute("src");
    if (!src) continue;
    var abs;
    try { abs = new URL(src, doc.baseURI).href; } catch (e) { abs = src; }
    if (!seen[abs]) { seen[abs] = true; out.push(abs); }
  }
  return out;
};
`;

export function buildEngineSource(rules: Rule[]): string {
  const inlined = rules
    .map(
      (rule) =>
        `{id:${JSON.stringify(rule.id)},impact:${JSON.stringify(rule.impact)},description:${JSON.stringify(
          rule.description,
        )},help:${JSON.stringify(rule.help)},tags:${JSON.stringify(rule.tags)},wcagSc:${JSON.stringify(
          rule.wcagSc,
        )},matcher:${JSON.stringify(rule.matcher)},extract:${rule.extract.toString()},checks:[${rule.checks
          .map((c) => `{id:${JSON.stringify(c.id)},evaluate:${c.evaluate.toString()}}`)
          .join(",")}]}`,
    )
    .join(",");

  return `(function () {
${FEATURES_SOURCE}
var __apfSlice = function (s) { try { return s.slice(0, 500); } catch (e) { return ""; } };
var RULES = [${inlined}];
window.__apfEngine = {
  run: function (tags) {
    var tagSet = {};
    for (var i = 0; i < tags.length; i++) tagSet[tags[i]] = true;
    var violations = [], passes = [], incomplete = [], inapplicable = [];
    var MAX_NODES = 100, MAX_BUCKET = 1000;
    for (var j = 0; j < RULES.length; j++) {
      var r = RULES[j];
      var matched = false;
      for (var k = 0; k < r.tags.length; k++) { if (tagSet[r.tags[k]]) { matched = true; break; } }
      if (!matched) continue;
      var nodes;
      try {
        nodes = r.matcher ? Array.prototype.slice.call(document.querySelectorAll(r.matcher)) : [document.documentElement];
      } catch (e) { continue; }
      if (nodes.length === 0) { inapplicable.push({ id: r.id, tags: r.tags, wcagSc: r.wcagSc || [] }); continue; }
      var fails = [], incs = [];
      for (var m = 0; m < nodes.length; m++) {
        var facts;
        try { facts = r.extract(nodes[m]); } catch (e) { facts = {}; }
        var allPass = true, anyIncomplete = false, failSummary = "";
        for (var c = 0; c < r.checks.length; c++) {
          var out;
          try { out = r.checks[c].evaluate(facts); } catch (e) { out = { result: "incomplete", failureSummary: "check errored" }; }
          if (out.result === "fail") { allPass = false; failSummary = out.failureSummary || failSummary; break; }
          if (out.result === "incomplete") anyIncomplete = true;
        }
        var nodeData = { target: [r.matcher || "html"], html: __apfSlice(nodes[m].outerHTML || ""), failureSummary: failSummary };
        if (!allPass) fails.push(nodeData);
        else if (anyIncomplete) incs.push(nodeData);
      }
      if (fails.length > 0) violations.push({ id: r.id, impact: r.impact, description: r.description, help: r.help, tags: r.tags, wcagSc: r.wcagSc || [], nodes: fails.slice(0, MAX_NODES) });
      else if (incs.length > 0) incomplete.push({ id: r.id, tags: r.tags, wcagSc: r.wcagSc || [], nodes: incs.slice(0, MAX_NODES) });
      else passes.push({ id: r.id, tags: r.tags, wcagSc: r.wcagSc || [] });
    }
    return { violations: violations.slice(0, MAX_BUCKET), passes: passes.slice(0, MAX_BUCKET), incomplete: incomplete.slice(0, MAX_BUCKET), inapplicable: inapplicable.slice(0, MAX_BUCKET), features: __apfFeatures(document), mediaUrls: __apfMediaUrls(document) };
  }
};
})();`;
}
