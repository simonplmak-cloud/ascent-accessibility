"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { PaletteCommand } from "./command-palette";

// Lazy-loaded so their code isn't in the shared bundle until the user actually
// opens the palette or the shortcut help (reduces initial JS + main-thread
// blocking on every page).
const CommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), {
  ssr: false,
});
const ShortcutHelp = dynamic(() => import("./shortcut-help").then((m) => m.ShortcutHelp), {
  ssr: false,
});

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

interface GlobalCommandDef {
  id: string;
  labelKey: string;
  keywords: string;
  shortcut?: string;
  group: string;
  run: () => void;
}

const GLOBAL_COMMAND_DEFS: GlobalCommandDef[] = [
  {
    id: "nav-scan",
    labelKey: "newScan",
    keywords: "assess scan website",
    shortcut: "/",
    group: "Navigate",
    run: () => {
      window.location.href = "/assess";
    },
  },
  {
    id: "nav-latest-report",
    labelKey: "viewLatestReport",
    keywords: "report latest result findings conformance",
    group: "Navigate",
    run: () => {
      // Resolve the user's most recent completed report, then open it. The list
      // endpoint returns newest-first; fall back to the workspace when none/error.
      void (async () => {
        try {
          const res = await fetch("/api/v1/assessments");
          const data = (await res.json()) as {
            assessments?: Array<{ id: string; status: string }>;
          };
          const completed = (data.assessments ?? []).find((a) => a.status === "completed");
          window.location.href = completed
            ? `/auditor/report/${encodeURIComponent(completed.id)}`
            : "/auditor";
        } catch {
          window.location.href = "/auditor";
        }
      })();
    },
  },
  {
    id: "nav-training",
    labelKey: "training",
    keywords: "learn course certificate",
    group: "Navigate",
    run: () => {
      window.location.href = "/training";
    },
  },
  {
    id: "nav-auditor",
    labelKey: "auditorWorkspace",
    keywords: "assessments history review",
    group: "Navigate",
    run: () => {
      window.location.href = "/auditor";
    },
  },
  {
    id: "nav-review",
    labelKey: "reviewQueue",
    keywords: "review workforce resolve",
    group: "Navigate",
    run: () => {
      window.location.href = "/auditor/review";
    },
  },
  {
    id: "nav-keys",
    labelKey: "apiAccess",
    keywords: "api keys",
    group: "Navigate",
    run: () => {
      window.location.href = "/api-keys";
    },
  },
];

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commands, setCommands] = useState<PaletteCommand[]>([]);

  const globalCommands = useMemo<PaletteCommand[]>(
    () =>
      GLOBAL_COMMAND_DEFS.map((d) => ({
        id: d.id,
        label: t(d.labelKey),
        keywords: d.keywords,
        ...(d.shortcut !== undefined ? { shortcut: d.shortcut } : {}),
        group: d.group,
        run: d.run,
      })),
    [t],
  );

  useEffect(() => {
    setCommands(globalCommands);
  }, [globalCommands]);

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
      {paletteOpen && <CommandPalette commands={commands} open onClose={() => setPaletteOpen(false)} />}
      {helpOpen && <ShortcutHelp open onClose={() => setHelpOpen(false)} />}
    </KeyboardContext.Provider>
  );
}
