import { agenticSpacing } from './agenticTokens';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingMarginMap = Record<
  HeadingLevel,
  { marginTop: number; marginBottom: number }
>;

/** Desktop / wide — agentic-ui editor content styles. */
export const headingMarginsDesktop: HeadingMarginMap = {
  1: { marginTop: agenticSpacing.margin8x, marginBottom: agenticSpacing.margin8x },
  2: {
    marginTop: agenticSpacing.margin8x,
    marginBottom: agenticSpacing.margin4x,
  },
  3: {
    marginTop: agenticSpacing.margin4x,
    marginBottom: agenticSpacing.margin2x,
  },
  4: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
  5: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
  6: { marginTop: agenticSpacing.margin2x, marginBottom: 0 },
};

/**
 * Figma Home chat `675:23865` — section titles (16px / lh 1.2) + 12px gap to body.
 */
export const headingMarginsMobile: HeadingMarginMap = {
  1: { marginTop: 20, marginBottom: 12 },
  2: { marginTop: 20, marginBottom: 12 },
  3: { marginTop: 16, marginBottom: 12 },
  4: { marginTop: 16, marginBottom: 12 },
  5: { marginTop: 12, marginBottom: 8 },
  6: { marginTop: 12, marginBottom: 8 },
};

/** @deprecated use headingMarginsDesktop */
export const headingMargins = headingMarginsDesktop;
