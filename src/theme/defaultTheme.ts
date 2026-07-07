import type { TextStyle, ViewStyle } from 'react-native';
import { agenticColors, agenticSpacing } from './agenticTokens';
import { fontFamilies } from './fonts';
import {
  headingMarginsDesktop,
  type HeadingMarginMap,
} from './headingMargins';

export interface MarkdownTheme {
  colors: {
    text: string;
    textMuted: string;
    link: string;
    linkUnderline: string;
    codeBackground: string;
    codeText: string;
    blockquoteBorder: string;
    blockquoteBackground: string;
    blockquoteText: string;
    border: string;
    tableHeaderBackground: string;
    taskCheckboxBorder: string;
    hr: string;
    errorBackground: string;
    errorBorder: string;
  };
  typography: {
    body: TextStyle;
    emphasis: TextStyle;
    caption: TextStyle;
    tableLabel: TextStyle;
    tableValue: TextStyle;
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    h4: TextStyle;
    h5: TextStyle;
    h6: TextStyle;
    code: TextStyle;
    inlineCode: TextStyle;
  };
  spacing: {
    paragraphGap: number;
    /** First paragraph in a message (Figma intro line → sections). */
    leadingParagraphGap: number;
    listIndent: number;
    listItemGap: number;
    listBlockMarginTop: number;
    listBlockMarginBottom: number;
    blockquotePadding: number;
    codeBlockPadding: number;
    tableCellPadding: number;
    tableBlockMarginVertical: number;
    headingMarginTop: number;
    headingMarginBottom: number;
  };
  blockquote: ViewStyle;
  headingMarginByLevel: HeadingMarginMap;
}

export type MarkdownThemeOverride = {
  colors?: Partial<MarkdownTheme['colors']>;
  typography?: Partial<MarkdownTheme['typography']>;
  spacing?: Partial<MarkdownTheme['spacing']>;
  blockquote?: Partial<ViewStyle>;
  headingMarginByLevel?: Partial<HeadingMarginMap>;
};

export const defaultTheme: MarkdownTheme = {
  colors: {
    text: agenticColors.text,
    textMuted: agenticColors.textMuted,
    link: agenticColors.text,
    linkUnderline: agenticColors.borderLight,
    codeBackground: agenticColors.codeBackground,
    codeText: agenticColors.text,
    blockquoteBorder: agenticColors.controlFillSecondary,
    blockquoteBackground: 'transparent',
    blockquoteText: agenticColors.textSecondary,
    border: agenticColors.borderLight,
    tableHeaderBackground: agenticColors.tableHeaderBackground,
    taskCheckboxBorder: agenticColors.borderLight,
    hr: agenticColors.borderLight,
    errorBackground: '#fff2f0',
    errorBorder: '#ffccc7',
  },
  typography: {
    body: { fontSize: 15, lineHeight: 23, ...fontFamilies.body },
    emphasis: { fontSize: 15, lineHeight: 23, fontWeight: '600', ...fontFamilies.body },
    caption: { fontSize: 12, lineHeight: 17, fontWeight: '500', ...fontFamilies.body },
    tableLabel: { fontSize: 15, lineHeight: 18, ...fontFamilies.body },
    tableValue: { fontSize: 15, lineHeight: 18, fontWeight: '600', ...fontFamilies.body },
    h1: { fontSize: 30, lineHeight: 38, fontWeight: '600', ...fontFamilies.body },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600', ...fontFamilies.body },
    h3: { fontSize: 18, lineHeight: 26, fontWeight: '600', ...fontFamilies.body },
    h4: { fontSize: 15, lineHeight: 24, fontWeight: '600', ...fontFamilies.body },
    h5: { fontSize: 15, lineHeight: 24, fontWeight: '600', ...fontFamilies.body },
    h6: { fontSize: 15, lineHeight: 24, fontWeight: '600', ...fontFamilies.body },
    code: { fontSize: 14, lineHeight: 20, ...fontFamilies.code },
    inlineCode: { fontSize: 14, ...fontFamilies.code },
  },
  spacing: {
    paragraphGap: agenticSpacing.margin2x,
    leadingParagraphGap: agenticSpacing.margin2x,
    listIndent: 28,
    listItemGap: agenticSpacing.margin1x,
    listBlockMarginTop: agenticSpacing.margin2x,
    listBlockMarginBottom: agenticSpacing.margin2x * 2,
    blockquotePadding: agenticSpacing.margin2x,
    codeBlockPadding: agenticSpacing.margin2x + agenticSpacing.margin1x,
    tableCellPadding: agenticSpacing.margin2x,
    tableBlockMarginVertical: agenticSpacing.margin1x,
    headingMarginTop: agenticSpacing.margin2x,
    headingMarginBottom: agenticSpacing.margin2x,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: agenticSpacing.margin2x + agenticSpacing.margin1x,
    marginTop: 0,
    marginBottom: 0,
  },
  headingMarginByLevel: headingMarginsDesktop,
};

export function mergeTheme(
  base: MarkdownTheme,
  partial?: MarkdownThemeOverride,
): MarkdownTheme {
  if (!partial) return base;
  return {
    colors: { ...base.colors, ...partial.colors },
    typography: { ...base.typography, ...partial.typography },
    spacing: { ...base.spacing, ...partial.spacing },
    blockquote: { ...base.blockquote, ...partial.blockquote },
    headingMarginByLevel: partial.headingMarginByLevel
      ? { ...base.headingMarginByLevel, ...partial.headingMarginByLevel }
      : base.headingMarginByLevel,
  };
}
