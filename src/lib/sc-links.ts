import { getSc, understandingUrl } from "@/lib/standards/wcag-sc";
import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { getScRemediation } from "@/lib/standards/sc-remediation";
import { LESSONS } from "@/lib/training/curriculum";

export interface ScLinks {
  understanding: string | null;
  manualTest: string;
  remediation: string;
  lessonHref: string | null;
}

// Reverse map: SC number -> training lesson id, built from the curriculum's
// sc-reference lessons (each lesson lists the SCs it covers). First match wins so
// a SC taught in both an "everyday" and a "deep dive" lesson resolves to one.
const LESSON_BY_SC = new Map<string, string>();
for (const lesson of Object.values(LESSONS)) {
  for (const sc of lesson.scs ?? []) {
    if (!LESSON_BY_SC.has(sc)) LESSON_BY_SC.set(sc, lesson.id);
  }
}

// Resolve the learn/fix links for a finding's SC: the W3C Understanding document,
// the manual test, the remediation guidance, and (when taught) the training
// lesson. `lessonHref` is null when the SC has no mapped lesson — the UI omits it.
export function linksForSc(scNum: string, locale?: string): ScLinks {
  const sc = getSc(scNum);
  const lessonId = LESSON_BY_SC.get(scNum) ?? null;
  return {
    understanding: sc ? understandingUrl(sc) : null,
    manualTest: getManualTest(scNum, locale),
    remediation: getScRemediation(scNum, locale),
    lessonHref: lessonId ? `/training/lessons/${lessonId}` : null,
  };
}
