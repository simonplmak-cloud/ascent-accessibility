import sharp from "sharp";

// Image optimization for evidence storage. Worker-only (the export path embeds
// the already-optimized stored images, so sharp is never needed on Vercel).
//
// Policy:
//   - page/context screenshots → JPEG q60, downscaled to ≤1600px (biggest win)
//   - element crops (primary violation evidence) → PNG lossless, only a
//     max-dimension safety cap (rarely triggers; preserves contrast/overlap)

const MAX_INPUT_PIXELS = 40_000_000; // decompression-bomb protection
export const EVIDENCE_MAX_DIMENSION_PX = 1600;
export const EVIDENCE_JPEG_QUALITY = 60;

export interface OptimizeOptions {
  format: "jpeg" | "png";
  quality?: number;
  maxDimension?: number;
}

export async function optimizeImage(
  buffer: Buffer,
  opts: OptimizeOptions,
): Promise<{ buffer: Buffer; mime: string }> {
  let img = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS });
  const metadata = await img.metadata();
  const maxDim = opts.maxDimension ?? EVIDENCE_MAX_DIMENSION_PX;
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (width > maxDim || height > maxDim) {
    img = img.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
  }
  if (opts.format === "jpeg") {
    return { buffer: await img.jpeg({ quality: opts.quality ?? EVIDENCE_JPEG_QUALITY }).toBuffer(), mime: "image/jpeg" };
  }
  return { buffer: await img.png().toBuffer(), mime: "image/png" };
}

/** Optimize a stored (base64) evidence image; returns the input unchanged on failure. */
export async function optimizeEvidenceImage(
  image: string,
  mime: string,
  kind: "page" | "element" | "snapshot",
): Promise<{ image: string; mime: string }> {
  if (!image) return { image, mime };
  try {
    const buffer = Buffer.from(image, "base64");
    const format = kind === "element" ? "png" : "jpeg";
    const out = await optimizeImage(buffer, { format });
    return { image: out.buffer.toString("base64"), mime: out.mime };
  } catch {
    /* sharp unavailable or invalid image — store as-is */
    return { image, mime };
  }
}
