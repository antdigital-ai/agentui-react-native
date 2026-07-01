import { toJsxRuntime, type Processor } from './remarkBundle';
import React from 'react';
import { Text, View } from 'react-native';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { MarkdownTheme } from '../theme/defaultTheme';
import type { MarkdownRnComponentsBundle } from './buildRnComponents';
import { wrapViewChildren } from './wrapViewChildren';

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
  const components = bundle.components;
  try {
    const mdast = processor.parse(blockContent);
    const hast = processor.runSync(mdast);
    const result = toJsxRuntime(hast as Parameters<typeof toJsxRuntime>[0], {
      Fragment,
      jsx: jsx as typeof jsx,
      jsxs: jsxs as typeof jsxs,
      components: components as Record<string, React.ComponentType>,
      passNode: true,
    });
    // RN requires all text nodes to be wrapped in <Text>, not bare strings.
    // hast-util-to-jsx-runtime may return bare strings for root-level text nodes.
    if (typeof result === 'string' || typeof result === 'number') {
      return <Text style={theme.typography.body}>{String(result)}</Text>;
    }
    if (React.isValidElement(result)) {
      const element = result as React.ReactElement<Record<string, unknown>>;
      return React.cloneElement(element, {
        children: wrapViewChildren(element.props.children as React.ReactNode, theme.typography.body),
      });
    }
    return result;
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
