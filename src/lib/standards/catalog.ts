export type WcagLevel = "A" | "AA" | "AAA";

export interface Standard {
  id: string;
  name: string;
  version: string;
  level: WcagLevel | null;
  tags: string[];
}

// Rules are tagged by the WCAG version they were introduced in (non-cumulative).
// Selecting a standard therefore requires the full cumulative tag set across
// versions. The `wcag22aa` tag carries the 2.2-AA additions, while `wcag22a`
// and `wcag22aaa` reuse the 2.0/2.1 tag sets for their respective levels.
export const STANDARDS: Standard[] = [
  {
    id: "wcag22aa",
    name: "WCAG 2.2 AA",
    version: "2.2",
    level: "AA",
    tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
  },
  {
    id: "wcag22a",
    name: "WCAG 2.2 A",
    version: "2.2",
    level: "A",
    tags: ["wcag2a", "wcag21a"],
  },
  {
    id: "wcag22aaa",
    name: "WCAG 2.2 AAA",
    version: "2.2",
    level: "AAA",
    tags: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag22aa"],
  },
  {
    id: "wcag21aa",
    name: "WCAG 2.1 AA",
    version: "2.1",
    level: "AA",
    tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
  {
    id: "wcag21a",
    name: "WCAG 2.1 A",
    version: "2.1",
    level: "A",
    tags: ["wcag2a", "wcag21a"],
  },
  {
    id: "wcag20aa",
    name: "WCAG 2.0 AA",
    version: "2.0",
    level: "AA",
    tags: ["wcag2a", "wcag2aa"],
  },
  {
    id: "wcag20a",
    name: "WCAG 2.0 A",
    version: "2.0",
    level: "A",
    tags: ["wcag2a"],
  },
  {
    id: "wcag20aaa",
    name: "WCAG 2.0 AAA",
    version: "2.0",
    level: "AAA",
    tags: ["wcag2a", "wcag2aa", "wcag2aaa"],
  },
  {
    id: "wcag21aaa",
    name: "WCAG 2.1 AAA",
    version: "2.1",
    level: "AAA",
    tags: ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag21aaa"],
  },
  {
    id: "section508",
    name: "Section 508",
    version: "508",
    level: null,
    tags: ["section508"],
  },
];

export const DEFAULT_STANDARD_ID = "wcag22aa";

const byId = new Map(STANDARDS.map((standard) => [standard.id, standard]));

export function listStandards(): Standard[] {
  return STANDARDS;
}

export function getStandard(id: string): Standard | undefined {
  return byId.get(id);
}

export function getDefaultStandard(): Standard {
  const standard = byId.get(DEFAULT_STANDARD_ID);
  if (!standard) {
    throw new Error(`Default standard "${DEFAULT_STANDARD_ID}" is missing from the catalog`);
  }
  return standard;
}
