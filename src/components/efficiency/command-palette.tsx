"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { rankCommands, type Command } from "@/lib/efficiency/palette";

export interface PaletteCommand extends Command {
  run: () => void;
}

export function CommandPalette({
  commands,
  open,
  onClose,
}: {
  commands: PaletteCommand[];
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ranked = rankCommands(query, commands);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setQuery("");
      setActive(0);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function run(cmd: PaletteCommand) {
    onClose();
    cmd.run();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={t("commandPalette")}
      className="w-[min(36rem,calc(100vw-2rem))] rounded border border-terminal-border bg-terminal-surface p-0 text-terminal-fg backdrop:bg-black/50"
    >
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-autocomplete="list"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, ranked.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && ranked[active]) {
            e.preventDefault();
            run(ranked[active]!);
          }
        }}
        placeholder={t("typeCommand")}
        className="w-full border-b border-terminal-border bg-terminal-surface px-4 py-3 font-sans text-sm text-terminal-fg placeholder:text-terminal-muted focus:outline-none"
      />
      <ul id="palette-list" role="listbox" aria-label={t("commands")} className="max-h-80 overflow-y-auto p-1">
        {ranked.length === 0 && (
          <li className="px-3 py-2 font-sans text-sm text-terminal-muted">{t("noCommands")}</li>
        )}
        {ranked.map((cmd, i) => (
          <li key={cmd.id} role="option" aria-selected={i === active}>
            <button
              type="button"
              onClick={() => run(cmd)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left font-sans text-sm ${
                i === active ? "bg-terminal-fg text-terminal-bg" : "text-terminal-fg"
              }`}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <span className={`text-xs ${i === active ? "text-terminal-bg/70" : "text-terminal-muted"}`}>
                  {cmd.shortcut}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
