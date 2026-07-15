import type { MarkdownTheme } from './defaultTheme';
import { agenticColors } from './agenticTokens';
import { figmaHomeSpacing } from './figmaHomeSpacing';
import { figmaHomeTextStyles } from './figmaHomeTypography';
import { figmaHomeCodeFontFamily } from './fonts';
import { headingMarginsMobile } from './headingMargins';

const figma = agenticColors.figmaHome;
const t = figmaHomeTextStyles;

/**
 * Full Markdown theme from Figma 首页 Home chat `675:23865`
 * (section titles, body 14/25, tables, quotes, hr `901:20534`).
 */
export const figmaHomeMarkdownTheme: MarkdownTheme = {
  colors: {
    text: figma.text,
    textMuted: figma.textSecondary,
    link: figma.linkPrimary,
    linkUnderline: figma.linkPrimary,
    codeBackground: 'rgba(0, 37, 37, 0.04)',
    codeText: figma.text,
    blockquoteBorder: figma.tableRowBorder,
    blockquoteBackground: 'transparent',
    blockquoteText: figma.textSecondary,
    border: figma.tableRowBorder,
    tableHeaderBackground: 'transparent',
    taskCheckboxBorder: figma.tableRowBorder,
    hr: figma.tableRowBorder,
    errorBackground: '#fff2f0',
    errorBorder: '#ffccc7',
  },
  typography: {
    body: { ...t.body, color: figma.text },
    emphasis: { ...t.emphasis, color: figma.text },
    caption: { ...t.caption, color: figma.textCaption },
    tableLabel: { ...t.label },
    tableValue: { ...t.tableRowValue },
    h1: { ...t.sectionTitle, color: figma.text },
    h2: { ...t.sectionTitle, color: figma.text },
    h3: { ...t.sectionTitle, color: figma.text },
    h4: { ...t.sectionTitle, color: figma.text },
    h5: { ...t.caption, color: figma.textSecondary, textAlign: 'left' },
    h6: {
      ...t.caption,
      color: figma.textCaption,
      textAlign: 'center',
    },
    code: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      ...figmaHomeCodeFontFamily,
    },
    inlineCode: {
      fontSize: 13,
      fontWeight: '500',
      ...figmaHomeCodeFontFamily,
    },
  },
  spacing: {
    paragraphGap: figmaHomeSpacing.listItemGap,
    leadingParagraphGap: figmaHomeSpacing.contentBlockGap,
    listIndent: figmaHomeSpacing.listNestedIndent,
    /** Figma bullets stack on line-height (no extra 12px between items). */
    listItemGap: 0,
    listBlockMarginTop: 0,
    listBlockMarginBottom: 0,
    blockquotePadding: figmaHomeSpacing.inSectionTitleGap,
    codeBlockPadding: figmaHomeSpacing.inSectionTitleGap,
    tableCellPadding: figmaHomeSpacing.inSectionTitleGap / 2,
    tableBlockMarginVertical: figmaHomeSpacing.inSectionTitleGap,
    headingMarginTop: figmaHomeSpacing.sectionGap,
    headingMarginBottom: figmaHomeSpacing.inSectionTitleGap,
    hrMarginVertical: figmaHomeSpacing.hrMarginVertical,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  headingMarginByLevel: headingMarginsMobile,
};
