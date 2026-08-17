import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  parseTheme,
  readTheme,
  writeTheme,
} from "@/lib/theme";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("theme", () => {
  it("defaults to dark", () => {
    expect(DEFAULT_THEME).toBe("dark");
  });

  describe("parseTheme", () => {
    it("coerces 'light' to light", () => {
      expect(parseTheme("light")).toBe("light");
    });
    it("coerces 'dark' to dark", () => {
      expect(parseTheme("dark")).toBe("dark");
    });
    it("coerces null to dark", () => {
      expect(parseTheme(null)).toBe("dark");
    });
    it("coerces undefined to dark", () => {
      expect(parseTheme(undefined)).toBe("dark");
    });
    it("coerces empty string to dark", () => {
      expect(parseTheme("")).toBe("dark");
    });
    it("coerces unknown string to dark", () => {
      expect(parseTheme("banana")).toBe("dark");
    });
  });

  it("reads a stored light preference", () => {
    expect(readTheme(memoryStorage({ [THEME_STORAGE_KEY]: "light" }))).toBe("light");
  });

  it("falls back to dark when nothing is stored", () => {
    expect(readTheme(memoryStorage())).toBe("dark");
  });

  it("falls back to dark on a corrupt stored value", () => {
    expect(readTheme(memoryStorage({ [THEME_STORAGE_KEY]: "not-a-theme" }))).toBe("dark");
  });

  it("persists the chosen theme and reads it back", () => {
    const storage = memoryStorage();
    writeTheme(storage, "light");
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(readTheme(storage)).toBe("light");
  });
});
