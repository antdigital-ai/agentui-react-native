import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { LayoutDensity } from '../theme/layout';
import type { DeepThinkingTheme } from './deepThinkingTheme';

/** Figma Home think row — loading / done / error */
export type DeepThinkingStatus = 'thinking' | 'completed' | 'failed';

export interface DeepThinkingLabels {
  thinking?: string;
  completed?: string;
  failed?: string;
}

export interface DeepThinkingProps {
  status: DeepThinkingStatus;
  /** Header line; defaults from `labels` + `status` */
  label?: string;
  /** Reasoning markdown shown when expanded */
  body?: string;
  /** Allow expand when `body` is non-empty. Default true. */
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  labels?: DeepThinkingLabels;
  layoutDensity?: LayoutDensity;
  theme?: Partial<DeepThinkingTheme>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Replace default AI glyph (32×32). */
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

/** Attached to assistant `ChatMessage` for MessageList integration */
export interface ChatMessageThinking {
  status: DeepThinkingStatus;
  label?: string;
  /** Markdown reasoning chain (expandable) */
  body?: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
  labels?: DeepThinkingLabels;
}
