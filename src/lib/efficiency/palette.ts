// Command-palette filtering/ranking — pure, node-testable.

export interface Command {
  id: string;
  label: string;
  keywords?: string;
  group?: string;
  shortcut?: string;
}

/**
 * Rank commands by relevance to a query. Empty query returns all (original order).
 * Priority: exact label prefix > label substring > keyword substring; ties break
 * toward shorter labels.
 */
export function rankCommands<T extends Command>(query: string, commands: readonly T[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...commands];
  return commands
    .map((cmd) => ({ cmd, score: scoreCommand(q, cmd) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.cmd.label.length - b.cmd.label.length)
    .map((x) => x.cmd);
}

function scoreCommand(q: string, cmd: Command): number {
  const label = cmd.label.toLowerCase();
  const keywords = (cmd.keywords ?? "").toLowerCase();
  if (label.startsWith(q)) return 300 - label.length;
  if (label.includes(q)) return 200 - label.indexOf(q);
  if (keywords.includes(q)) return 100 - keywords.indexOf(q);
  return 0;
}
