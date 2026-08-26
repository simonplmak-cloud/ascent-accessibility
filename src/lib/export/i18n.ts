// Server-side i18n for the PDF renderer. react-pdf renders outside React, so we
// can't use the next-intl hook; instead we load the message catalog for the
// assessment's locale and resolve report/acr namespace keys with a minimal
// `{name}` interpolator (the report + acr namespaces use only named-arg
// interpolation, no ICU plurals/selects).
//
// Static imports (not dynamic) so this works identically under Next (Vercel
// export fallback) and esbuild (the worker's generate-once PDF render).

import en from "../../../messages/en.json";
import zhHans from "../../../messages/zh-Hans.json";
import zhHant from "../../../messages/zh-Hant.json";

export type ReportTFn = (key: string, vars?: Record<string, string | number>) => string;

export interface ReportStrings {
  t: ReportTFn;
  tAcr: ReportTFn;
  tBeta: ReportTFn;
  locale: string;
}

function makeT(namespace: Record<string, unknown>): ReportTFn {
  return (key, vars) => {
    const raw = namespace[key];
    const template = typeof raw === "string" ? raw : key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => {
      const value = vars[name];
      return value === undefined ? `{${name}}` : String(value);
    });
  };
}

const CATALOGS: Record<string, Record<string, Record<string, unknown>>> = {
  en: en as Record<string, Record<string, unknown>>,
  "zh-Hans": zhHans as Record<string, Record<string, unknown>>,
  "zh-Hant": zhHant as Record<string, Record<string, unknown>>,
};

export function loadReportStrings(locale?: string | null): ReportStrings {
  const loc = locale === "zh-Hant" || locale === "zh-Hans" ? locale : "en";
  const catalog = CATALOGS[loc] ?? CATALOGS.en!;
  return {
    t: makeT(catalog.report ?? {}),
    tAcr: makeT(catalog.acr ?? {}),
    tBeta: makeT(catalog.beta ?? {}),
    locale: loc,
  };
}
