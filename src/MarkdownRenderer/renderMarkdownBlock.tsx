import { toJsxRuntime, type Processor } from './remarkBundle';
import React from 'react';
import { Text, View } from 'react-native';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { MarkdownTheme } from '../theme/defaultTheme';
import type { MarkdownRnComponentsBundle } from './buildRnComponents';

export type RenderMarkdownBlockOptions = {
  isFirstBlock?: boolean;
};

export const renderMarkdownBlock = (
  blockContent: string,
  processor: Processor,
  bundle: MarkdownRnComponentsBundle,
  theme: MarkdownTheme,
  options?: RenderMarkdownBlockOptions,
): React.ReactNode => {
  if (!blockContent.trim()) return null;
  bundle.beginMarkdownBlock(options?.isFirstBlock ?? true);
  const components = bundle.components;
  try {
    const mdast = processor.parse(blockContent);
    const hast = processor.runSync(mdast);
    return toJsxRuntime(hast as Parameters<typeof toJsxRuntime>[0], {
      Fragment,
      jsx: jsx as typeof jsx,
      jsxs: jsxs as typeof jsxs,
      components: components as Record<string, React.ComponentType>,
      passNode: true,
    });
  } catch {
    return (
      <View
        testID="markdown-block-error-fallback"
        style={{
          marginVertical: 8,
          padding: 12,
          backgroundColor: theme.colors.errorBackground,
          borderWidth: 1,
          borderColor: theme.colors.errorBorder,
          borderRadius: 4,
        }}
      >
        <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>{blockContent}</Text>
      </View>
    );
  }
};
