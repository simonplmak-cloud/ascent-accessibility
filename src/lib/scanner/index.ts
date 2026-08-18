import type { Impact } from "@/lib/scoring";
import type { PageFeatures } from "@/lib/standards/sc-applicability";

export interface ScanNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface ScanViolation {
  id: string;
  impact: Impact;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ScanNode[];
  nodeCount: number;
}

export interface RuleSummary {
  id: string;
  tags: string[];
  nodes?: ScanNode[];
}

export interface ScanResult {
  url: string;
  violations: ScanViolation[];
  passes: RuleSummary[];
  incomplete: RuleSummary[];
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
  nodes?: RawNode[];
}

export interface RawScanResult {
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
  content(): Promise<string>;
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

function mapNode(node: RawNode): ScanNode {
  return {
    html: node.html ?? "",
    target: node.target ?? [],
    failureSummary: node.failureSummary ?? "",
  };
}

export function mapRuleSummary(rule: RawRule): RuleSummary {
  return { id: rule.id, tags: rule.tags ?? [], nodes: (rule.nodes ?? []).map(mapNode) };
}

export function mapViolations(raw: RawScanResult): ScanViolation[] {
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
