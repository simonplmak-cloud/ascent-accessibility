import type { Impact } from "@/lib/scoring";

export interface AxeViolation {
  id: string;
  impact: Impact;
  description: string;
  nodeCount: number;
}

export interface ScanResult {
  url: string;
  violations: AxeViolation[];
  passesCount: number;
}

export class ScanFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanFailedError";
  }
}

export interface RawViolation {
  id: string;
  impact: string | null;
  description: string;
  nodes: unknown[];
}

export interface RawAxeResult {
  violations: RawViolation[];
  passes: Array<{ id: string }>;
}

export interface ScannerPage {
  goto(url: string, options?: { timeout?: number }): Promise<{ status(): number } | null>;
  addInitScript(options: { path: string } | { content: string }): Promise<void>;
  evaluate(pageFn: (arg: string[]) => unknown, arg: string[]): Promise<unknown>;
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

export function mapViolations(raw: RawAxeResult): AxeViolation[] {
  return raw.violations.map((violation) => ({
    id: violation.id,
    impact: normalizeImpact(violation.impact),
    description: violation.description,
    nodeCount: violation.nodes.length,
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

  return { url, violations: mapViolations(raw), passesCount: raw.passes.length };
}
