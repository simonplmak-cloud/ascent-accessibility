export interface ScVerdict {
  sc: string;
  result: "pass" | "fail" | "needs-review" | "not-applicable";
}

export interface ParityReport {
  total: number;
  agreed: number;
  agreementPct: number;
  disagreements: Array<{ sc: string; engine: string; oracle: string }>;
}

export function computeParity(engine: ScVerdict[], oracle: ScVerdict[]): ParityReport {
  const oracleMap = new Map(oracle.map((v) => [v.sc, v.result]));
  let agreed = 0;
  const disagreements: ParityReport["disagreements"] = [];
  let total = 0;

  for (const v of engine) {
    const expected = oracleMap.get(v.sc);
    if (expected === undefined) continue;
    total += 1;
    if (expected === v.result) agreed += 1;
    else disagreements.push({ sc: v.sc, engine: v.result, oracle: expected });
  }

  return {
    total,
    agreed,
    agreementPct: total === 0 ? 100 : Math.round((agreed / total) * 1000) / 10,
    disagreements,
  };
}
