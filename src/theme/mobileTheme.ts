import type { ChatTheme } from '../MessageList/chatTheme';
import type { MarkdownThemeOverride } from './defaultTheme';
import { agenticColors } from './agenticTokens';
import { figmaHomeSpacing } from './figmaHomeSpacing';
import { figmaHomeTextStyles } from './figmaHomeTypography';
import { figmaHomeCodeFontFamily } from './fonts';
import { headingMarginsMobile } from './headingMargins';

const figma = agenticColors.figmaHome;
const t = figmaHomeTextStyles;

/**
 * Chat chrome — Figma「Crypto Analysis - crypto」`675:23865` (375×812).
 * User: `Chat bubbles` 280px / 12px pad / purple tint; assistant: full 335px, no card.
 */
export const compactChatTheme: Partial<ChatTheme> = {
  listPadding: figmaHomeSpacing.chatPaddingHorizontal,
  listPaddingTop: figmaHomeSpacing.chatPaddingTop,
  listPaddingBottom: figmaHomeSpacing.chatPaddingBottom,
  listPaddingHorizontal: figmaHomeSpacing.chatPaddingHorizontal,
  bubbleGap: figmaHomeSpacing.messageGap,
  bubblePadding: 12,
  assistantBubblePadding: 0,
  bubbleRadius: 12,
  userBubbleMaxWidth: figma.userBubbleMaxWidth,
  assistantBubbleMaxWidth: '100%',
  userBubbleBackground: figma.userBubbleBackground,
  assistantBubbleBackground: 'transparent',
};

/** Figma: 段落/base 14·1.8, 标题/h4 16·1.2, 正文/lg-强调 16·600, 正文/sm 12 */
export const compactMarkdownTheme: MarkdownThemeOverride = {
  colors: {
    text: figma.text,
    textMuted: figma.textSecondary,
    link: figma.text,
    codeText: figma.text,
  },
  typography: {
    body: { ...t.body, color: figma.text },
    emphasis: { ...t.emphasis, color: figma.text },
    caption: { ...t.caption, color: figma.textCaption },
    tableLabel: { ...t.label },
    tableValue: { ...t.titleLg, color: figma.text },
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
    code: { fontSize: 13, lineHeight: 18, fontWeight: '500', ...figmaHomeCodeFontFamily },
    inlineCode: { fontSize: 13, fontWeight: '500', ...figmaHomeCodeFontFamily },
  },
  spacing: {
    paragraphGap: figmaHomeSpacing.listItemGap,
    leadingParagraphGap: figmaHomeSpacing.contentBlockGap,
    listIndent: figmaHomeSpacing.listNestedIndent,
    listItemGap: figmaHomeSpacing.listItemGap,
    listBlockMarginTop: figmaHomeSpacing.inSectionTitleGap,
    listBlockMarginBottom: figmaHomeSpacing.inSectionTitleGap,
    blockquotePadding: figmaHomeSpacing.inSectionTitleGap,
    codeBlockPadding: figmaHomeSpacing.inSectionTitleGap,
    tableCellPadding: figmaHomeSpacing.inSectionTitleGap,
    tableBlockMarginVertical: figmaHomeSpacing.inSectionTitleGap,
    headingMarginTop: figmaHomeSpacing.sectionGap,
    headingMarginBottom: figmaHomeSpacing.inSectionTitleGap,
  },
  headingMarginByLevel: headingMarginsMobile,
};

export function mergeMarkdownThemeOverrides(
  ...layers: (MarkdownThemeOverride | undefined)[]
): MarkdownThemeOverride | undefined {
  const merged: MarkdownThemeOverride = {};
  for (const layer of layers) {
    if (!layer) continue;
    if (layer.colors) merged.colors = { ...merged.colors, ...layer.colors };
    if (layer.typography) {
      merged.typography = { ...merged.typography, ...layer.typography };
    }
    if (layer.spacing) merged.spacing = { ...merged.spacing, ...layer.spacing };
    if (layer.blockquote) {
      merged.blockquote = { ...merged.blockquote, ...layer.blockquote };
    }
    if (layer.headingMarginByLevel) {
      merged.headingMarginByLevel = {
        ...merged.headingMarginByLevel,
        ...layer.headingMarginByLevel,
      };
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}
