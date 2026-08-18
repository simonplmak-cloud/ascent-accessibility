import {
  WCAG_SCS,
  type WcagLevel,
  type WcagSc,
  type WcagVersion,
} from "./wcag-sc";

const VERSION_RANK: Record<WcagVersion, number> = { "2.0": 0, "2.1": 1, "2.2": 2 };
const LEVEL_RANK: Record<WcagLevel, number> = { A: 1, AA: 2, AAA: 3 };

export function scsForStandard(version: string, level: WcagLevel): WcagSc[] {
  const v = version as WcagVersion;
  if (!(v in VERSION_RANK)) return [];
  const vRank = VERSION_RANK[v];
  const lRank = LEVEL_RANK[level];
  return WCAG_SCS.filter((sc) => {
    if (VERSION_RANK[sc.introducedIn] > vRank) return false;
    if (sc.removedIn && VERSION_RANK[sc.removedIn] <= vRank) return false;
    if (LEVEL_RANK[sc.level] > lRank) return false;
    return true;
  });
}
