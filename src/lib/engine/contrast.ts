export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseRgbColor(color: string): Rgb | null {
  const m =
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(
      color,
    );
  if (!m) return null;
  return {
    r: parseFloat(m[1]!),
    g: parseFloat(m[2]!),
    b: parseFloat(m[3]!),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function isLargeText(fontSizePx: number, fontWeight: number): boolean {
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
}

export function contrastThreshold(isLarge: boolean): number {
  return isLarge ? 3 : 4.5;
}
