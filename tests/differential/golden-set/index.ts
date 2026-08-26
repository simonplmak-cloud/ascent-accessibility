import type { GoldenLabel } from "../ai-parity";

// Human-labeled golden set for the AC-19 / AC-E6 parity gate.
//
// Screenshots are NOT committed (binary); they live under
//   tests/differential/golden-set/screenshots/<id>.png
// and are loaded into `runAiParityEval` (tests/differential/ai-parity.ts) as
// Buffers. Each entry lists the SCs an image exercises and the human oracle's
// verdict for each (pass | fail | needs-review).
//
// Populate this from the 5-site audit in Phase 6: for each judgeable rule, label
// at least one known-good and one known-bad screenshot. A rule whose parity falls
// below the gate (precision >= 0.8, false-"pass" = 0, false-"needs-review" <= 0.4)
// must not ship.
export interface GoldenSetEntry {
  id: string;
  imagePath: string;
  labels: GoldenLabel[];
}

export const GOLDEN_SET: GoldenSetEntry[] = [];
