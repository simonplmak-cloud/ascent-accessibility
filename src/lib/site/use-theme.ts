"use client";

import { useEffect, useState } from "react";
import { writeTheme, type Theme } from "@/lib/site/theme";

/**
 * Current theme (from `<html class="dark">`) plus a setter that applies and
 * persists the choice. Initial value is "dark" to match the server render;
 * a useEffect then syncs to the real DOM class (already set by the no-FOUC
 * script before hydration) and tracks later changes.
 */
export function useTheme(): { theme: Theme; setTheme: (next: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setThemeState(el.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      writeTheme(window.localStorage, next);
    } catch {
      // Preference just won't persist; the switch still applies this session.
    }
  }

  return { theme, setTheme };
}
