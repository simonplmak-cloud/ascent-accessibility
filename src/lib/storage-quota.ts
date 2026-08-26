import { assessmentRepository, evidenceRepository, reportPdfRepository } from "@/db/repository";

export const STORAGE_QUOTA_BYTES_PER_USER = Number(
  process.env.STORAGE_QUOTA_BYTES_PER_USER ?? 524_288_000,
);
export const SCAN_PRE_ESTIMATE_BYTES_PER_PAGE = Number(
  process.env.SCAN_PRE_ESTIMATE_BYTES_PER_PAGE ?? 122_880,
);

/** Committed storage for an owner: evidence + assessment + report_pdf bytes. */
export async function usedBytesByOwner(ownerId: string): Promise<number> {
  const [evidence, assessment, reportPdf] = await Promise.all([
    evidenceRepository.sumBytesByOwner(ownerId),
    assessmentRepository.sumBytesByOwner(ownerId),
    reportPdfRepository.sumBytesByOwner(ownerId),
  ]);
  return evidence + assessment + reportPdf;
}

export interface QuotaDecision {
  allowed: boolean;
  usedBytes: number;
  quotaBytes: number;
  estimateBytes: number;
}

/** Hard-reject decision at scan submit: committed usage + estimated scan size vs quota. */
export function assessStorageQuota(
  usedBytes: number,
  quotaBytes: number,
  pageCap: number,
  perPageBytes: number = SCAN_PRE_ESTIMATE_BYTES_PER_PAGE,
): QuotaDecision {
  const estimateBytes = pageCap * perPageBytes;
  return { allowed: usedBytes + estimateBytes <= quotaBytes, usedBytes, quotaBytes, estimateBytes };
}
