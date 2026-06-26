import type { TextStyle, ViewStyle } from 'react-native';

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
    body: { fontSize: 16, lineHeight: 24 },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    h4: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
    h5: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
    h6: { fontSize: 14, lineHeight: 22, fontWeight: '600' },
    code: { fontSize: 14, lineHeight: 20, fontFamily: 'monospace' },
    inlineCode: { fontSize: 14, fontFamily: 'monospace' },
  },
  spacing: {
    paragraphGap: 8,
    listIndent: 20,
    listItemGap: 4,
    blockquotePadding: 12,
    codeBlockPadding: 12,
    tableCellPadding: 8,
    headingMarginTop: 16,
    headingMarginBottom: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginVertical: 8,
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
