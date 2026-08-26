// One-off image optimisation for the website-audit byte-weight reduction.
// Run on the workbench: `node scripts/optimize-images.mjs`.
import sharp from "sharp";

const favicon = "public/favicon.png";
const og = "public/images/og-image.png";
const logo = "public/images/apf-logo.png";

await sharp(favicon).resize(32, 32).png({ compressionLevel: 9 }).toFile("public/favicon-32.png");
await sharp(favicon).resize(180, 180).png({ compressionLevel: 9 }).toFile("public/apple-touch-icon.png");
await sharp(og).webp({ quality: 80 }).toFile("public/images/og-image.webp");
await sharp(logo).webp({ quality: 85 }).toFile("public/images/apf-logo.webp");
console.log("optimised images written");
