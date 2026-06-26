import type { DimensionValue } from 'react-native';

export interface ChatTheme {
  listPadding: number;
  bubbleGap: number;
  bubblePadding: number;
  bubbleRadius: number;
  bubbleMaxWidth: DimensionValue;
  userBubbleBackground: string;
  assistantBubbleBackground: string;
}

export const defaultChatTheme: ChatTheme = {
  listPadding: 12,
  bubbleGap: 8,
  bubblePadding: 8,
  bubbleRadius: 8,
  bubbleMaxWidth: '85%',
  userBubbleBackground: '#1677ff',
  assistantBubbleBackground: '#f5f5f5',
};

export function mergeChatTheme(
  base: ChatTheme,
  partial?: Partial<ChatTheme>,
): ChatTheme {
  if (!partial) return base;
  return { ...base, ...partial };
}
