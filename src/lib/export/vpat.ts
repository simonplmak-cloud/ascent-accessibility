export type VpatEdition = "wcag" | "508" | "eu";

export type VpatConformanceLevel =
  | "Supports"
  | "Partially Supports"
  | "Does Not Support"
  | "Not Applicable"
  | "Not Evaluated";

// Maps a conformance verdict to a VPAT 2.4 conformance level (AC-14).
export function vpatLevel(verdict: string): VpatConformanceLevel {
  switch (verdict) {
    case "Passed":
      return "Supports";
    case "Failed":
      return "Does Not Support";
    case "NotPresent":
      return "Not Applicable";
    case "CannotTell":
    case "NotChecked":
      return "Not Evaluated";
    default:
      return "Not Evaluated";
  }
}

export interface VpatRow {
  criterion: string;
  title?: string;
  verdict: string;
  remark?: string;
}

export interface VpatDocument {
  edition: VpatEdition;
  title: string;
  complete: boolean;
  criteria: Array<{
    criterion: string;
    title: string;
    conformanceLevel: VpatConformanceLevel;
    remark: string;
  }>;
}

const VPAT_TITLES: Record<VpatEdition, string> = {
  wcag: "VPAT 2.4 Rev WCAG (WCAG 2.x)",
  "508": "VPAT 2.4 Rev 508 (Section 508)",
  eu: "VPAT 2.4 Rev EU (EN 301 549)",
};

// Generates a third-party-verified ACR. `complete` is false when any criterion
// is still "Cannot tell" / "Not checked" (AC-E4) — the document is then a draft,
// not a completed conformance review.
export function generateVpat(input: { edition: VpatEdition; rows: VpatRow[] }): VpatDocument {
  const criteria = input.rows.map((row) => ({
    criterion: row.criterion,
    title: row.title ?? row.criterion,
    conformanceLevel: vpatLevel(row.verdict),
    remark: row.remark ?? "",
  }));
  const complete = input.rows.every(
    (row) => row.verdict !== "CannotTell" && row.verdict !== "NotChecked",
  );
  return {
    edition: input.edition,
    title: VPAT_TITLES[input.edition],
    complete,
    criteria,
  };
}
