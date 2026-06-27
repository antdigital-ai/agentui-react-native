import type { DimensionValue } from 'react-native';
import { agenticColors } from '../theme/agenticTokens';

export interface ChatTheme {
  listPadding: number;
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

export const defaultChatTheme: ChatTheme = {
  listPadding: 16,
  bubbleGap: 8,
  bubblePadding: 12,
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
