export interface PageFeatures {
  hasContent: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  hasVideoCaptions: boolean;
  hasAudioDescription: boolean;
  hasForms: boolean;
  hasTables: boolean;
  hasIframes: boolean;
  hasMetaRefresh: boolean;
  hasMarquee: boolean;
  hasAccesskey: boolean;
  hasPositiveTabindex: boolean;
  hasDragHandlers: boolean;
  hasTouchHandlers: boolean;
  hasImages: boolean;
  hasBackgroundImages: boolean;
  hasAnimatedContent: boolean;
  hasAutoplay: boolean;
  hasLiveContent: boolean;
  hasLinks: boolean;
  hasHeadings: boolean;
  hasLandmarks: boolean;
  hasLang: boolean;
  hasInteractive: boolean;
  hasTimeLimit: boolean;
}

export const EMPTY_FEATURES: PageFeatures = {
  hasContent: false,
  hasVideo: false,
  hasAudio: false,
  hasVideoCaptions: false,
  hasAudioDescription: false,
  hasForms: false,
  hasTables: false,
  hasIframes: false,
  hasMetaRefresh: false,
  hasMarquee: false,
  hasAccesskey: false,
  hasPositiveTabindex: false,
  hasDragHandlers: false,
  hasTouchHandlers: false,
  hasImages: false,
  hasBackgroundImages: false,
  hasAnimatedContent: false,
  hasAutoplay: false,
  hasLiveContent: false,
  hasLinks: false,
  hasHeadings: false,
  hasLandmarks: false,
  hasLang: false,
  hasInteractive: false,
  hasTimeLimit: false,
};

export function mergeFeatures(a: PageFeatures, b: PageFeatures): PageFeatures {
  const out = { ...EMPTY_FEATURES };
  for (const key of Object.keys(EMPTY_FEATURES) as Array<keyof PageFeatures>) {
    out[key] = a[key] || b[key];
  }
  return out;
}

export type Applicability = "applicable" | "not-applicable";

// Determines whether a success criterion is relevant to the page's content.
// Returns "not-applicable" when the page has no content of the kind the SC
// concerns (so the SC is satisfied by absence); "applicable" otherwise.
export function checkScApplicability(scNum: string, f: PageFeatures): Applicability {
  switch (scNum) {
    case "1.1.1":
      return f.hasImages || f.hasBackgroundImages ? "applicable" : "not-applicable";
    case "1.2.1":
    case "1.2.2":
    case "1.2.3":
    case "1.2.5":
    case "1.2.6":
    case "1.2.7":
    case "1.2.8":
      return f.hasVideo || f.hasAudio ? "applicable" : "not-applicable";
    case "1.2.4":
    case "1.2.9":
      // live media cannot be detected automatically — assume absent
      return "not-applicable";
    case "1.3.5":
      return f.hasForms ? "applicable" : "not-applicable";
    case "1.4.2":
      return f.hasAudio ? "applicable" : "not-applicable";
    case "1.4.5":
    case "1.4.9":
      return f.hasImages ? "applicable" : "not-applicable";
    case "2.1.1":
    case "2.1.2":
    case "2.4.3":
    case "2.4.7":
    case "2.5.3":
      return f.hasInteractive ? "applicable" : "not-applicable";
    case "2.1.4":
      return f.hasAccesskey ? "applicable" : "not-applicable";
    case "2.2.1":
      return f.hasTimeLimit ? "applicable" : "not-applicable";
    case "2.2.2":
      return f.hasMarquee || f.hasAnimatedContent || f.hasAutoplay ? "applicable" : "not-applicable";
    case "2.3.1":
      return "not-applicable";
    case "2.4.6":
      return f.hasHeadings ? "applicable" : "not-applicable";
    case "2.5.1":
      return f.hasTouchHandlers ? "applicable" : "not-applicable";
    case "2.5.2":
      return f.hasTouchHandlers || f.hasDragHandlers ? "applicable" : "not-applicable";
    case "2.5.4":
      return f.hasDragHandlers ? "applicable" : "not-applicable";
    case "3.1.2":
      return f.hasContent ? "applicable" : "not-applicable";
    case "3.2.2":
      return f.hasForms ? "applicable" : "not-applicable";
    case "3.3.1":
    case "3.3.2":
    case "3.3.3":
    case "3.3.4":
    case "3.3.5":
    case "3.3.6":
    case "3.3.7":
    case "3.3.8":
    case "3.3.9":
      return f.hasForms ? "applicable" : "not-applicable";
    case "4.1.3":
      return f.hasLiveContent ? "applicable" : "not-applicable";
    default:
      // Structural SCs that apply whenever the page has any content; only the
      // clearly content-gated ones above return "not-applicable".
      return f.hasContent ? "applicable" : "not-applicable";
  }
}
