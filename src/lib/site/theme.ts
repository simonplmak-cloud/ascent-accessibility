export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "wcag-theme";
export const DEFAULT_THEME: Theme = "dark";

/** Minimal storage shape the helpers need (satisfied by `window.localStorage`). */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Coerce an arbitrary stored value into a valid theme, defaulting to dark. */
export function parseTheme(value: unknown): Theme {
  return value === "light" ? "light" : "dark";
}

/** Read the stored theme, falling back to dark on missing/invalid values. */
export function readTheme(storage: ThemeStorage): Theme {
  return parseTheme(storage.getItem(THEME_STORAGE_KEY));
}

/** Persist the chosen theme. */
export function writeTheme(storage: ThemeStorage, theme: Theme): void {
  storage.setItem(THEME_STORAGE_KEY, theme);
}
