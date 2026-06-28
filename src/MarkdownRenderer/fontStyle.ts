import type { TextStyle } from 'react-native';

/** Legacy HTML font size 1–7 → px (approximate). */
const LEGACY_FONT_SIZE_PX = [10, 13, 16, 18, 24, 32, 48] as const;

export function parseFontSizeAttr(
  size: string | number | undefined | null,
): number | undefined {
  if (size == null || size === '') return undefined;
  const raw = String(size).trim();
  const pxMatch = /^(\d+(?:\.\d+)?)\s*px$/i.exec(raw);
  if (pxMatch) return Number(pxMatch[1]);
  const n = Number(raw);
  if (Number.isNaN(n)) return undefined;
  if (Number.isInteger(n) && n >= 1 && n <= 7 && !raw.includes('.')) {
    return LEGACY_FONT_SIZE_PX[n - 1];
  }
  return n;
}

export function fontTagTextStyle(
  color: unknown,
  size: unknown,
  base: TextStyle,
): TextStyle {
  const style: TextStyle = { ...base };
  if (typeof color === 'string' && color.trim()) {
    style.color = color.trim();
  }
  const fontSize = parseFontSizeAttr(
    typeof size === 'string' || typeof size === 'number' ? size : undefined,
  );
  if (fontSize != null) {
    style.fontSize = fontSize;
    if (base.lineHeight != null && base.fontSize != null && base.fontSize > 0) {
      style.lineHeight = Math.round(
        (Number(base.lineHeight) / Number(base.fontSize)) * fontSize,
      );
    }
  }
  return style;
}
