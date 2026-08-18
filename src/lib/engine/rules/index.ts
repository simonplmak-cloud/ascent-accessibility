import type { Rule } from "../types";
import { perceivableRules } from "./perceivable";
import { operableRules } from "./operable";
import { understandableRules } from "./understandable";
import { robustRules } from "./robust";
import { renderingRules } from "./rendering";
import { interactionRules } from "./interaction";

export const ALL_RULES: Rule[] = [
  ...perceivableRules,
  ...operableRules,
  ...understandableRules,
  ...robustRules,
  ...renderingRules,
  ...interactionRules,
];

export function selectRules(tags: readonly string[]): Rule[] {
  const tagSet = new Set(tags);
  return ALL_RULES.filter((rule) => rule.tags.some((tag) => tagSet.has(tag)));
}
