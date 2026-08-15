declare module "accessibility-checker" {
  export interface IbmResult {
    ruleId: string;
    reasonId: string;
    value: string[];
    path?: { dom?: string; aria?: string };
    message: string;
    snippet?: string;
    level: string;
  }
  export interface IbmSummary {
    counts: {
      violation: number;
      potentialviolation: number;
      recommendation: number;
      pass: number;
      manual: number;
    };
  }
  export interface IbmReport {
    summary: IbmSummary;
    results: IbmResult[];
  }
  export function getCompliance(
    page: unknown,
    label: string,
  ): Promise<{ report?: IbmReport }>;
  export function getRules(): Promise<
    Array<{ id: string; rulesets?: Array<{ num: string | string[] }> }>
  >;
}
