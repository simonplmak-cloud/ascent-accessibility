import type { Impact } from "@/lib/scoring";

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
  goto(url: string, options?: { timeout?: number }): Promise<{ status(): number } | null>;
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
    response = await page.goto(url, { timeout: 45_000 });
  } catch (error) {
    throw new ScanFailedError(`Could not load ${url}: ${(error as Error).message}`);
  }

  const status = response?.status();
  if (status !== undefined && (status < 200 || status >= 400)) {
    throw new ScanFailedError(`Could not load ${url}: HTTP ${status}`);
  }

  const raw = (await page.evaluate((runTags) => {
    const axe = (globalThis as { axe?: AxeRunner }).axe;
    if (!axe) throw new Error("axe-core failed to load");
    return axe.run(document, { runOnly: { type: "tag", values: runTags } });
  }, tags)) as RawAxeResult;

  return {
    url,
    violations: mapViolations(raw),
    passes: (raw.passes ?? []).map(mapRuleSummary),
    incomplete: (raw.incomplete ?? []).map(mapRuleSummary),
  };
}
