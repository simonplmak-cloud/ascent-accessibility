// One-off generator for the reverse (white-on-transparent) logo used on the
// dark terminal theme. Run on the workbench: `node scripts/make-reverse-logo.mjs`.
import sharp from "sharp";

const src = "public/images/apf-logo.png";

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

const rgba = Buffer.alloc(data.length);
for (let i = 0; i < width * height; i++) {
  rgba[i * 4] = 255;
  rgba[i * 4 + 1] = 255;
  rgba[i * 4 + 2] = 255;
  rgba[i * 4 + 3] = data[i * 4 + 3];
}

const reversed = sharp(rgba, { raw: { width, height, channels: 4 } });
await reversed.clone().png().toFile("public/images/apf-logo-reverse.png");
await reversed.clone().webp({ quality: 90 }).toFile("public/images/apf-logo-reverse.webp");

console.log(`reverse logo written (${width}x${height})`);
