import type { ChatTheme } from '../MessageList/chatTheme';
import type { MarkdownThemeOverride } from './defaultTheme';
import { agenticColors } from './agenticTokens';
import { figmaHomeSpacing } from './figmaHomeSpacing';
import { figmaHomeMarkdownTheme } from './figmaHomeTheme';

const figma = agenticColors.figmaHome;

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

/**
 * @deprecated Prefer `defaultTheme` / `figmaHomeMarkdownTheme` —
 * Figma Home is now the library default. Kept as a no-op-shaped override
 * for hosts that still pass `layoutDensity="compact"`.
 */
export const compactMarkdownTheme: MarkdownThemeOverride = {
  colors: { ...figmaHomeMarkdownTheme.colors },
  typography: { ...figmaHomeMarkdownTheme.typography },
  spacing: { ...figmaHomeMarkdownTheme.spacing },
  blockquote: { ...figmaHomeMarkdownTheme.blockquote },
  headingMarginByLevel: figmaHomeMarkdownTheme.headingMarginByLevel,
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
