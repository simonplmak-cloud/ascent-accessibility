import type { Rule } from "./types";

// In-page rule evaluation source. Rules are self-contained (they only reference
// browser globals), so `check.toString()` inlines them safely into this script.
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
`;

export function buildEngineSource(rules: Rule[]): string {
  const inlined = rules
    .map(
      (rule) =>
        `{id:${JSON.stringify(rule.id)},impact:${JSON.stringify(rule.impact)},description:${JSON.stringify(
          rule.description,
        )},help:${JSON.stringify(rule.help)},tags:${JSON.stringify(rule.tags)},selector:${JSON.stringify(
          rule.selector,
        )},check:${rule.check.toString()}}`,
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
    var violations = [], passes = [], incomplete = [];
    for (var j = 0; j < RULES.length; j++) {
      var r = RULES[j];
      var matched = false;
      for (var k = 0; k < r.tags.length; k++) { if (tagSet[r.tags[k]]) { matched = true; break; } }
      if (!matched) continue;
      var nodes;
      try {
        nodes = r.selector ? Array.prototype.slice.call(document.querySelectorAll(r.selector)) : [document.documentElement];
      } catch (e) { continue; }
      if (nodes.length === 0) continue;
      var fails = [], incs = [];
      for (var m = 0; m < nodes.length; m++) {
        var out;
        try { out = r.check(nodes[m]); } catch (e) { out = { result: "incomplete", failureSummary: "check errored" }; }
        var nodeData = { target: [r.selector || "html"], html: __apfSlice(nodes[m].outerHTML || ""), failureSummary: out.failureSummary || "" };
        if (out.result === "fail") fails.push(nodeData);
        else if (out.result === "incomplete") incs.push(nodeData);
      }
      if (fails.length > 0) violations.push({ id: r.id, impact: r.impact, description: r.description, help: r.help, tags: r.tags, nodes: fails });
      else if (incs.length > 0) incomplete.push({ id: r.id, tags: r.tags, nodes: incs });
      else passes.push({ id: r.id, tags: r.tags });
    }
    return { violations: violations, passes: passes, incomplete: incomplete, features: __apfFeatures(document) };
  }
};
})();`;
}
