import type { TextStyle, ViewStyle } from 'react-native';
import { fontFamilies } from './fonts';

export interface MarkdownTheme {
  colors: {
    text: string;
    textMuted: string;
    link: string;
    codeBackground: string;
    codeText: string;
    blockquoteBorder: string;
    blockquoteBackground: string;
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

export const defaultTheme: MarkdownTheme = {
  colors: {
    text: '#1f1f1f',
    textMuted: 'rgba(0,0,0,0.45)',
    link: '#1677ff',
    codeBackground: '#f5f5f5',
    codeText: '#1f1f1f',
    blockquoteBorder: '#d9d9d9',
    blockquoteBackground: '#fafafa',
    border: '#f0f0f0',
    tableHeaderBackground: '#fafafa',
    taskCheckboxBorder: '#d9d9d9',
    hr: '#f0f0f0',
    errorBackground: '#fff2f0',
    errorBorder: '#ffccc7',
  },
  typography: {
    body: { fontSize: 15, lineHeight: 22, ...fontFamilies.body },
    h1: { fontSize: 26, lineHeight: 32, fontWeight: '600', ...fontFamilies.body },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: '600', ...fontFamilies.body },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: '600', ...fontFamilies.body },
    h4: { fontSize: 16, lineHeight: 22, fontWeight: '600', ...fontFamilies.body },
    h5: { fontSize: 15, lineHeight: 22, fontWeight: '600', ...fontFamilies.body },
    h6: { fontSize: 14, lineHeight: 20, fontWeight: '600', ...fontFamilies.body },
    code: { fontSize: 13, lineHeight: 18, ...fontFamilies.code },
    inlineCode: { fontSize: 13, ...fontFamilies.code },
  },
  spacing: {
    paragraphGap: 4,
    listIndent: 16,
    listItemGap: 2,
    blockquotePadding: 6,
    codeBlockPadding: 8,
    tableCellPadding: 6,
    headingMarginTop: 10,
    headingMarginBottom: 4,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginTop: 4,
    marginBottom: 4,
  },
};

export function mergeTheme(
  base: MarkdownTheme,
  partial?: Partial<MarkdownTheme>,
): MarkdownTheme {
  if (!partial) return base;
  return {
    colors: { ...base.colors, ...partial.colors },
    typography: { ...base.typography, ...partial.typography },
    spacing: { ...base.spacing, ...partial.spacing },
    blockquote: { ...base.blockquote, ...partial.blockquote },
  };
}
