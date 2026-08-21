"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CommandPalette, type PaletteCommand } from "./command-palette";
import { ShortcutHelp } from "./shortcut-help";

interface KeyboardContextValue {
  registerCommands: (commands: PaletteCommand[]) => void;
  openPalette: () => void;
}

const KeyboardContext = createContext<KeyboardContextValue>({
  registerCommands: () => {},
  openPalette: () => {},
});

export function useCommandPalette(): KeyboardContextValue {
  return useContext(KeyboardContext);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.isContentEditable;
}

const GLOBAL_COMMANDS: PaletteCommand[] = [
  {
    id: "nav-scan",
    label: "New scan",
    keywords: "assess scan website",
    shortcut: "/",
    group: "Navigate",
    run: () => {
      window.location.href = "/assess";
    },
  },
  {
    id: "nav-training",
    label: "Training",
    keywords: "learn course certificate",
    group: "Navigate",
    run: () => {
      window.location.href = "/training";
    },
  },
  {
    id: "nav-auditor",
    label: "Auditor workspace",
    keywords: "assessments history review",
    group: "Navigate",
    run: () => {
      window.location.href = "/auditor";
    },
  },
  {
    id: "nav-review",
    label: "Review queue",
    keywords: "review workforce resolve",
    group: "Navigate",
    run: () => {
      window.location.href = "/auditor/review";
    },
  },
  {
    id: "nav-keys",
    label: "API access",
    keywords: "api keys",
    group: "Navigate",
    run: () => {
      window.location.href = "/api-keys";
    },
  },
];

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commands, setCommands] = useState<PaletteCommand[]>(GLOBAL_COMMANDS);

  const registerCommands = useCallback((cmds: PaletteCommand[]) => {
    setCommands((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const c of cmds) byId.set(c.id, c);
      return [...byId.values()];
    });
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (!mod && e.key === "?" && !isEditableTarget(e.target)) {
        e.preventDefault();
        setHelpOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <KeyboardContext.Provider value={{ registerCommands, openPalette }}>
      {children}
      <CommandPalette commands={commands} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </KeyboardContext.Provider>
  );
}
