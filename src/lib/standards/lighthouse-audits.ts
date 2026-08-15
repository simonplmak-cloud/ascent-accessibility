// Lighthouse accessibility audit -> weight, sourced from Lighthouse
// core/config/default-config.js (weights derive from axe impact + tags).
// Weight-0 audits are manual/non-scored and surface as a manual checklist.
export const LIGHTHOUSE_AUDIT_WEIGHTS: Record<string, number> = {
  "accesskeys": 7,
  "aria-allowed-attr": 10,
  "aria-command-name": 7,
  "aria-conditional-attr": 7,
  "aria-deprecated-role": 1,
  "aria-dialog-name": 7,
  "aria-hidden-body": 10,
  "aria-hidden-focus": 7,
  "aria-input-field-name": 7,
  "aria-meter-name": 7,
  "aria-progressbar-name": 7,
  "aria-prohibited-attr": 7,
  "aria-required-attr": 10,
  "aria-required-children": 10,
  "aria-required-parent": 10,
  "aria-roles": 10,
  "aria-text": 7,
  "aria-toggle-field-name": 7,
  "aria-tooltip-name": 7,
  "aria-treeitem-name": 7,
  "aria-valid-attr-value": 10,
  "aria-valid-attr": 10,
  "button-name": 10,
  "bypass": 7,
  "color-contrast": 7,
  "definition-list": 7,
  "dlitem": 7,
  "document-title": 7,
  "duplicate-id-aria": 10,
  "form-field-multiple-labels": 3,
  "frame-title": 7,
  "heading-order": 3,
  "html-has-lang": 7,
  "html-lang-valid": 7,
  "html-xml-lang-mismatch": 3,
  "image-alt": 10,
  "input-button-name": 10,
  "input-image-alt": 10,
  "label": 10,
  "link-in-text-block": 7,
  "link-name": 7,
  "list": 7,
  "listitem": 7,
  "meta-refresh": 10,
  "meta-viewport": 10,
  "object-alt": 7,
  "select-name": 10,
  "skip-link": 3,
  "tabindex": 7,
  "target-size": 7,
  "td-headers-attr": 7,
  "th-has-data-cells": 7,
  "valid-lang": 7,
  "video-caption": 10,
  "landmark-one-main": 3,
  "autocomplete-valid": 1,
  "presentation-role-conflict": 1,
  "svg-img-alt": 1,
};

export const LIGHTHOUSE_MANUAL_AUDITS: string[] = [
  "focusable-controls",
  "interactive-element-affordance",
  "logical-tab-order",
  "visual-order-follows-dom",
  "focus-traps",
  "managed-focus",
  "use-landmarks",
  "offscreen-content-hidden",
  "custom-controls-labels",
  "custom-controls-roles",
  "table-duplicate-name",
  "empty-heading",
  "aria-allowed-role",
  "image-redundant-alt",
  "identical-links-same-purpose",
  "label-content-name-mismatch",
  "table-fake-caption",
  "td-has-header",
];

export interface LighthouseScore {
  score: number;
  failedAudits: Array<{ id: string; weight: number }>;
}

// Lighthouse accessibility score = weighted pass-rate over scored audits.
export function computeLighthouseScore(violationIds: Iterable<string>): LighthouseScore {
  const failed = new Set(violationIds);
  let totalWeight = 0;
  let passedWeight = 0;
  const failedAudits: Array<{ id: string; weight: number }> = [];
  for (const [id, weight] of Object.entries(LIGHTHOUSE_AUDIT_WEIGHTS)) {
    totalWeight += weight;
    if (failed.has(id)) failedAudits.push({ id, weight });
    else passedWeight += weight;
  }
  const score = totalWeight === 0 ? 100 : Math.round((passedWeight / totalWeight) * 100);
  return { score, failedAudits };
}
