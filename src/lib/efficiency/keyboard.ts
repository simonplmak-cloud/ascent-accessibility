// Keyboard-shortcut utilities — pure, node-testable. DOM/event matching lives in
// the KeyboardProvider component (not unit-tested, no jsdom).

export interface ShortcutDef {
  keys: string;
  action: string;
}

/** Canonical form for comparing combo strings ("mod+k", "g s", "Shift+Enter"). */
export function normalizeCombo(combo: string): string {
  return combo.toLowerCase().replace(/\s+/g, "").trim();
}

/** Find shortcut key combos bound to more than one action. */
export function findCollisions(
  defs: readonly ShortcutDef[],
): Array<{ keys: string; actions: string[] }> {
  const byKeys = new Map<string, string[]>();
  for (const def of defs) {
    const key = normalizeCombo(def.keys);
    const list = byKeys.get(key) ?? [];
    list.push(def.action);
    byKeys.set(key, list);
  }
  return [...byKeys.entries()]
    .filter(([, actions]) => actions.length > 1)
    .map(([keys, actions]) => ({ keys, actions }));
}

/** Single source of truth for the global shortcut map. */
export const GLOBAL_SHORTCUTS: readonly ShortcutDef[] = [
  { keys: "mod+k", action: "Open command palette" },
  { keys: "?", action: "Show shortcuts" },
  { keys: "g t", action: "Go to training" },
  { keys: "g a", action: "Go to auditor" },
];
