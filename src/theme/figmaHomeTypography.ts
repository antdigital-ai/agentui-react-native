import type { TextStyle } from 'react-native';
import { agenticColors } from './agenticTokens';
import { figmaHomeCodeFontFamily, figmaHomeFontFamily } from './fonts';

const figma = agenticColors.figmaHome;

/** Figma 首页 Home chat `675:23865` — 段落/base, 标题/h4, 正文/sm, 正文/lg-强调 */
export const figmaHomeTextStyles = {
  /** 段落/base · Mona Medium · 14 · lh 1.8 */
  body: {
    fontSize: 14,
    lineHeight: 25,
    fontWeight: '500',
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** 段落/base-强调 · SemiBold */
  emphasis: {
    fontSize: 14,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** 标题/h4 · Bold · 16 · lh 1.2 */
  sectionTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** 正文/lg-强调 · 16 · SemiBold (BTC-PERP, stat values) */
  titleLg: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** 正文/sm · 12 (disclaimer, timestamp) */
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** 正文/base on 文本和图标/次要 — stat table label col */
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0,
    color: figma.textSecondary,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
  /** Stat table value col · 段落/base-强调 · 14 · lh 20 (rows, not title/lg 16) */
  tableRowValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0,
    color: figma.text,
    ...figmaHomeFontFamily,
  } satisfies TextStyle,
} as const;
