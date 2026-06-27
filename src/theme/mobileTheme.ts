import type { ChatTheme } from '../MessageList/chatTheme';
import type { MarkdownThemeOverride } from './defaultTheme';
import { agenticColors } from './agenticTokens';
import { fontFamilies } from './fonts';
import { headingMarginsMobile } from './headingMargins';

const figma = agenticColors.figmaHome;

/**
 * Chat chrome — Figma「Crypto Analysis - crypto」`675:23865` (375×812).
 * User: `Chat bubbles` 280px / 12px pad / purple tint; assistant: full 335px, no card.
 */
export const compactChatTheme: Partial<ChatTheme> = {
  listPadding: figma.horizontalGutter,
  bubbleGap: 16,
  bubblePadding: 12,
  assistantBubblePadding: 0,
  bubbleRadius: 12,
  userBubbleMaxWidth: figma.userBubbleMaxWidth,
  assistantBubbleMaxWidth: '100%',
  userBubbleBackground: figma.userBubbleBackground,
  assistantBubbleBackground: 'transparent',
};

/** 段落/base: 14px · lh 1.8 · #1e1f1f; 标题/h4: 16px bold · lh 1.2 */
export const compactMarkdownTheme: MarkdownThemeOverride = {
  colors: {
    text: figma.text,
    textMuted: figma.textCaption,
    link: figma.text,
    codeText: figma.text,
  },
  typography: {
    body: {
      fontSize: 14,
      lineHeight: 25,
      fontWeight: '500',
      ...fontFamilies.body,
    },
    h1: { fontSize: 20, lineHeight: 24, fontWeight: '700', ...fontFamilies.body },
    h2: { fontSize: 18, lineHeight: 22, fontWeight: '700', ...fontFamilies.body },
    h3: { fontSize: 16, lineHeight: 19, fontWeight: '700', ...fontFamilies.body },
    h4: { fontSize: 16, lineHeight: 19, fontWeight: '700', ...fontFamilies.body },
    h5: { fontSize: 14, lineHeight: 19, fontWeight: '700', ...fontFamilies.body },
    h6: { fontSize: 14, lineHeight: 19, fontWeight: '700', ...fontFamilies.body },
    code: { fontSize: 13, lineHeight: 18, ...fontFamilies.code },
    inlineCode: { fontSize: 13, ...fontFamilies.code },
  },
  spacing: {
    paragraphGap: 8,
    listIndent: 16,
    listItemGap: 4,
    blockquotePadding: 8,
    codeBlockPadding: 12,
    tableCellPadding: 8,
    headingMarginTop: 16,
    headingMarginBottom: 12,
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
