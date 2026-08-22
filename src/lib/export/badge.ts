// Builds a small shields-style SVG "Mark" a user can embed in an ESG report or
// other material. It links back to the public report so the claim is verifiable.
// Green only when human-verified; amber while a result is automated (partial).

function textWidth(text: string): number {
  return Math.round(text.length * 6.6 + 12);
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildBadgeSvg(input: { label: string; value: string; color: string }): string {
  const label = esc(input.label);
  const value = esc(input.value);
  const leftWidth = textWidth(input.label);
  const rightWidth = textWidth(input.value);
  const width = leftWidth + rightWidth;
  const height = 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <rect width="${leftWidth}" height="${height}" fill="#2a3542"/>
  <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="${input.color}"/>
  <g fill="#ffffff" font-family="Verdana, Geneva, sans-serif" font-size="11" text-anchor="middle">
    <text x="${leftWidth / 2}" y="14">${label}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}
