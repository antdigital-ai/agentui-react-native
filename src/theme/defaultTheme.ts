import type { TextStyle, ViewStyle } from 'react-native';
import { agenticColors, agenticSpacing } from './agenticTokens';
import { fontFamilies } from './fonts';

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
    listIndent: number;
    listItemGap: number;
    blockquotePadding: number;
    codeBlockPadding: number;
    tableCellPadding: number;
    headingMarginTop: number;
    headingMarginBottom: number;
  };
  blockquote: ViewStyle;
}

export type MarkdownThemeOverride = {
  colors?: Partial<MarkdownTheme['colors']>;
  typography?: Partial<MarkdownTheme['typography']>;
  spacing?: Partial<MarkdownTheme['spacing']>;
  blockquote?: Partial<ViewStyle>;
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
    listIndent: 28,
    listItemGap: agenticSpacing.margin1x,
    blockquotePadding: agenticSpacing.margin2x,
    codeBlockPadding: agenticSpacing.margin2x + agenticSpacing.margin1x,
    tableCellPadding: agenticSpacing.margin2x,
    headingMarginTop: agenticSpacing.margin2x,
    headingMarginBottom: agenticSpacing.margin2x,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: agenticSpacing.margin2x + agenticSpacing.margin1x,
    marginTop: 0,
    marginBottom: 0,
  },
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
  };
}
