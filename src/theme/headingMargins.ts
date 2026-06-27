import { agenticSpacing } from './agenticTokens';
import { figmaHomeSpacing } from './figmaHomeSpacing';

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
 * Figma Home chat `675:23865` — section titles + block gaps.
 * h4: 24 between sections, 12 title→body; h5 subtext; h6 disclaimer.
 */
export const headingMarginsMobile: HeadingMarginMap = {
  1: { marginTop: figmaHomeSpacing.sectionGap, marginBottom: figmaHomeSpacing.inSectionTitleGap },
  2: { marginTop: figmaHomeSpacing.sectionGap, marginBottom: figmaHomeSpacing.inSectionTitleGap },
  3: { marginTop: figmaHomeSpacing.sectionGap, marginBottom: figmaHomeSpacing.inSectionTitleGap },
  4: { marginTop: figmaHomeSpacing.inSectionTitleGap, marginBottom: figmaHomeSpacing.inSectionTitleGap },
  5: { marginTop: 4, marginBottom: 8 },
  6: { marginTop: figmaHomeSpacing.footerBlockGap, marginBottom: 0 },
};

/** @deprecated use headingMarginsDesktop */
export const headingMargins = headingMarginsDesktop;
