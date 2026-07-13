import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { NormalizeChatMarkdownMode } from './normalizeChatMarkdown';
import type { ParseIncompleteMarkdownOptions } from './parseIncompleteMarkdown';
import type { Plugin } from './remarkBundle';
import type { MarkdownThemeOverride } from '../theme/defaultTheme';
import type { LayoutDensity } from '../theme/layout';
import type { AgentCardData } from './agentCard';

export interface ContentThrottleOptions {
  charsPerFrame?: number;
  speed?: number;
  flushOnComplete?: boolean;
  backgroundInterval?: number;
  backgroundBatchMultiplier?: number;
  enabled?: boolean;
  /** Web GPT-style fade; no-op on React Native */
  fade?: boolean;
}

export type MarkdownRemarkPlugin = Plugin | [Plugin, ...unknown[]];

export interface MarkdownRendererEleProps {
  tagName: string;
  node?: unknown;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export interface RendererBlockProps {
  node?: unknown;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export type AgentCardRendererProps = RendererBlockProps & {
  data: AgentCardData;
};

export interface MarkdownRendererProps {
  content: string;
  streaming?: boolean;
  isFinished?: boolean;
  throttleOptions?: ContentThrottleOptions;
  remarkPlugins?: MarkdownRemarkPlugin[];
  className?: string;
  style?: StyleProp<ViewStyle>;
  linkConfig?: {
    onPress?: (url?: string) => boolean | void;
  };
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
  components?: Record<string, React.ComponentType<RendererBlockProps>> & {
    /** Custom renderer for ```agent-card JSON fences. */
    agentCard?: React.ComponentType<AgentCardRendererProps>;
  };
  theme?: MarkdownThemeOverride;
  /** `auto`: phone native + web viewport under 768px use compact markdown. */
  layoutDensity?: LayoutDensity;
  /** Which normalize pipeline to run before rendering. */
  normalizeMode?: NormalizeChatMarkdownMode | 'thinking';
  /** Streamdown-style remend options for the streaming tail block. */
  parseIncompleteMarkdown?: ParseIncompleteMarkdownOptions;
  testID?: string;
}

export interface MarkdownRendererRef {
  getDisplayedContent: () => string;
}

export interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  components?: Record<string, React.ComponentType<RendererBlockProps>> & {
    /** Custom renderer for ```agent-card JSON fences. */
    agentCard?: React.ComponentType<AgentCardRendererProps>;
  };
  linkConfig?: MarkdownRendererProps['linkConfig'];
  streaming?: boolean;
  /** When true, tail-block streaming guards (incomplete line holdback) are disabled. */
  isFinished?: boolean;
  contentRevisionSource?: string;
  eleRender?: MarkdownRendererProps['eleRender'];
  theme?: MarkdownThemeOverride;
  normalizeMode?: NormalizeChatMarkdownMode | 'thinking';
  parseIncompleteMarkdown?: ParseIncompleteMarkdownOptions;
}
