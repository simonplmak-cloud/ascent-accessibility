import { defineRouting } from "next-intl/routing";

// Locale routing. English is the default and unprefixed (/); Chinese variants are
// prefixed (/zh-Hant, /zh-Hans). Add a locale here plus a messages/<locale>.json
// file to support another language.
export const routing = defineRouting({
  locales: ["en", "zh-Hant", "zh-Hans"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: {
    secure: process.env.NODE_ENV === "production",
  },
});

export type Locale = (typeof routing.locales)[number];
