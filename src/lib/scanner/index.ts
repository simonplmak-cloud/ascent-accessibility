import type { Impact } from "@/lib/scoring";
import type { PageFeatures } from "@/lib/standards/sc-applicability";

export interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface AxeViolation {
  id: string;
  impact: Impact;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
  nodeCount: number;
}

export interface AxeRuleSummary {
  id: string;
  tags: string[];
}

export interface ScanResult {
  url: string;
  violations: AxeViolation[];
  passes: AxeRuleSummary[];
  incomplete: AxeRuleSummary[];
  features: PageFeatures;
}

export class ScanFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanFailedError";
  }
}

export interface RawNode {
  html?: string;
  target?: string[];
  failureSummary?: string;
}

export interface RawViolation {
  id: string;
  impact: string | null;
  description: string;
  help?: string;
  helpUrl?: string;
  tags?: string[];
  nodes: RawNode[];
}

export interface RawRule {
  id: string;
  tags?: string[];
}

export interface RawAxeResult {
  violations: RawViolation[];
  passes?: RawRule[];
  incomplete?: RawRule[];
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  type?: "png" | "jpeg";
  quality?: number;
}

export interface ScannerPage {
  goto(
    url: string,
    options?: {
      timeout?: number;
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
    },
  ): Promise<{ status(): number } | null>;
  addInitScript(options: { path: string } | { content: string }): Promise<void>;
  evaluate(pageFn: (arg: string[]) => unknown, arg: string[]): Promise<unknown>;
  screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  screenshotElement(selector: string): Promise<Buffer>;
}

export function normalizeImpact(impact: string | null): Impact {
  switch (impact) {
    case "critical":
    case "serious":
    case "moderate":
    case "minor":
      return impact;
    default:
      return "minor";
  }
}

function mapNode(node: RawNode): AxeNode {
  return {
    html: node.html ?? "",
    target: node.target ?? [],
    failureSummary: node.failureSummary ?? "",
  };
}

function mapRuleSummary(rule: RawRule): AxeRuleSummary {
  return { id: rule.id, tags: rule.tags ?? [] };
}

export function mapViolations(raw: RawAxeResult): AxeViolation[] {
  return raw.violations.map((violation) => ({
    id: violation.id,
    impact: normalizeImpact(violation.impact),
    description: violation.description,
    help: violation.help ?? "",
    helpUrl: violation.helpUrl ?? "",
    tags: violation.tags ?? [],
    nodes: (violation.nodes ?? []).map(mapNode),
    nodeCount: violation.nodes?.length ?? 0,
  }));
}

interface AxeRunner {
  run(
    context: unknown,
    options: { runOnly: { type: "tag"; values: string[] } },
  ): Promise<RawAxeResult>;
}

export async function scanPage(
  url: string,
  tags: string[],
  page: ScannerPage,
): Promise<ScanResult> {
  let response: { status(): number } | null;
  try {
    // domcontentloaded is enough for axe-core (DOM + render-blocking CSS are
    // ready); waiting for the full `load` event costs seconds on slow sites
    // that stream images/scripts.
    response = await page.goto(url, { timeout: 45_000, waitUntil: "domcontentloaded" });
  } catch (error) {
    throw new ScanFailedError(`Could not load ${url}: ${(error as Error).message}`);
  }

  const status = response?.status();
  if (status !== undefined && (status < 200 || status >= 400)) {
    throw new ScanFailedError(`Could not load ${url}: HTTP ${status}`);
  }

  // Give async scripts / lazy content a moment to render before axe runs.
  await new Promise((resolve) => setTimeout(resolve, Number(process.env.SCAN_SETTLE_MS ?? 300)));

  const result = (await page.evaluate(async (runTags) => {
    const axe = (globalThis as { axe?: AxeRunner }).axe;
    if (!axe) throw new Error("axe-core failed to load");
    const raw = await axe.run(document, { runOnly: { type: "tag", values: runTags } });

    const has = (sel: string): boolean => !!document.querySelector(sel);
    const features = {
      hasContent: (document.body?.textContent ?? "").trim().length > 0,
      hasVideo: has("video"),
      hasAudio: has("audio"),
      hasVideoCaptions: has("video track[kind='captions'], video track[kind='subtitles']"),
      hasAudioDescription: has("video track[kind='descriptions']"),
      hasForms: has("form, input, select, textarea"),
      hasTables: has("table"),
      hasIframes: has("iframe"),
      hasMetaRefresh: has("meta[http-equiv='refresh' i]"),
      hasMarquee: has("marquee, blink"),
      hasAccesskey: has("[accesskey]"),
      hasPositiveTabindex: Array.from(document.querySelectorAll("[tabindex]")).some(
        (el) => parseInt(el.getAttribute("tabindex") || "0", 10) > 0,
      ),
      hasDragHandlers: has("[draggable='true'], [ondrop], [ondragstart], [ondragover]"),
      hasTouchHandlers: has("[ontouchstart], [ontouchmove], [ontouchend], [ongesturestart]"),
      hasImages: has("img, svg"),
      hasBackgroundImages: has("[style*='background-image'], [style*='background:url']"),
      hasAnimatedContent: has("[style*='animation'], [style*='transition'], marquee"),
      hasAutoplay: has("video[autoplay], audio[autoplay]"),
      hasLiveContent: has("[aria-live]"),
      hasLinks: has("a[href]"),
      hasHeadings: has("h1,h2,h3,h4,h5,h6"),
      hasLandmarks: has("main, nav, header, footer, [role='main']"),
      hasLang: !!document.documentElement.lang,
      hasInteractive: has("a[href], button, input, select, textarea, [role='button']"),
      hasTimeLimit: has("meta[http-equiv='refresh' i]"),
    };
    return { raw, features };
  }, tags)) as { raw: RawAxeResult; features: PageFeatures };

  return {
    url,
    violations: mapViolations(result.raw),
    passes: (result.raw.passes ?? []).map(mapRuleSummary),
    incomplete: (result.raw.incomplete ?? []).map(mapRuleSummary),
    features: result.features,
  };
}
