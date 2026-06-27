import type { StyleProp, ViewStyle } from 'react-native';
import type { ContentThrottleOptions } from '../MarkdownRenderer/types';
import type { LayoutDensity } from '../theme/layout';
import type { ChatTheme } from './chatTheme';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Typically only the last assistant message in a list */
  streaming?: boolean;
  isFinished?: boolean;
}

export interface MessageListProps {
  messages: ChatMessage[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Scroll to bottom when messages grow; default true */
  autoScrollToBottom?: boolean;
  throttleOptions?: ContentThrottleOptions;
  chatTheme?: Partial<ChatTheme>;
  /** `auto`: compact bubbles on native and narrow web (see MOBILE_LAYOUT_BREAKPOINT). */
  layoutDensity?: LayoutDensity;
  testID?: string;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  chatTheme: ChatTheme;
  throttleOptions?: ContentThrottleOptions;
  layoutDensity?: LayoutDensity;
  isLast?: boolean;
}
