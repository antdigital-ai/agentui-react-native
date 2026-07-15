import type { DimensionValue } from 'react-native';
import { agenticColors } from '../theme/agenticTokens';
import { figmaHomeSpacing } from '../theme/figmaHomeSpacing';

export interface ChatTheme {
  listPadding: number;
  listPaddingTop?: number;
  listPaddingBottom?: number;
  listPaddingHorizontal?: number;
  bubbleGap: number;
  bubblePadding: number;
  /** Assistant rows (Figma Home: flush markdown, no inner padding). */
  assistantBubblePadding?: number;
  bubbleRadius: number;
  userBubbleMaxWidth: DimensionValue;
  assistantBubbleMaxWidth: DimensionValue;
  userBubbleBackground: string;
  assistantBubbleBackground: string;
}

const figma = agenticColors.figmaHome;

/** Default chat chrome = Figma Home `675:23865`. */
export const defaultChatTheme: ChatTheme = {
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

/** Wide / desktop agentic bubble layout — `layoutDensity="comfortable"`. */
export const desktopChatTheme: Partial<ChatTheme> = {
  listPadding: 16,
  listPaddingTop: undefined,
  listPaddingBottom: undefined,
  listPaddingHorizontal: undefined,
  bubbleGap: 8,
  bubblePadding: 12,
  assistantBubblePadding: 12,
  bubbleRadius: 12,
  userBubbleMaxWidth: '75%',
  assistantBubbleMaxWidth: '85%',
  userBubbleBackground: agenticColors.userBubbleBackground,
  assistantBubbleBackground: agenticColors.assistantBubbleBackground,
};

export function mergeChatTheme(
  base: ChatTheme,
  ...partials: (Partial<ChatTheme> | undefined)[]
): ChatTheme {
  return partials.reduce<ChatTheme>(
    (acc, partial) => (partial ? { ...acc, ...partial } : acc),
    base,
  );
}
