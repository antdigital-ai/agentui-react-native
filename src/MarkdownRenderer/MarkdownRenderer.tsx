import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { Text, View } from 'react-native';
import { webClassName } from '../theme/webClassName';
import { MarkdownThemeProvider } from '../theme/MarkdownThemeProvider';
import { compactMarkdownTheme, mergeMarkdownThemeOverrides } from '../theme/mobileTheme';
import { desktopMarkdownTheme } from '../theme/defaultTheme';
import { useCompactLayout } from '../theme/useCompactLayout';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
} from './types';
import { useContentThrottle } from './useContentThrottle';
import { useMarkdownToReact } from './useStreamingMarkdownReact';
import { MarkdownErrorBoundary } from './MarkdownErrorBoundary';
import { useMarkdownThemeWithOverride } from '../theme/MarkdownThemeProvider';

const MarkdownRendererInner = forwardRef<
  MarkdownRendererRef,
  MarkdownRendererProps
>((props, ref) => {
  const {
    content,
    streaming = false,
    isFinished,
    throttleOptions,
    remarkPlugins,
    style,
    linkConfig,
    eleRender,
    components,
    normalizeMode,
    parseIncompleteMarkdown,
    testID = 'markdown-renderer',
  } = props;

  const sourceText = content || '';
  const throttleEnabled = streaming && throttleOptions?.enabled !== false;
  const theme = useMarkdownThemeWithOverride(undefined);

  const displayedText = useContentThrottle(
    sourceText,
    throttleEnabled,
    throttleOptions,
    isFinished,
  );
  const renderText =
    streaming && throttleEnabled && !isFinished ? displayedText : sourceText;

  useImperativeHandle(ref, () => ({
    getDisplayedContent: () => displayedText,
  }));

  const reactContent = useMarkdownToReact(renderText, {
    remarkPlugins,
    linkConfig,
    streaming,
    isFinished,
    components,
    eleRender,
    contentRevisionSource: streaming ? sourceText : undefined,
    normalizeMode,
    parseIncompleteMarkdown,
  });

  return (
    <View
      testID={testID}
      style={style}
      collapsable={false}
      {...webClassName('agentui-markdown')}
    >
      <MarkdownErrorBoundary
        content={sourceText}
        bodyStyle={theme.typography.body}
      >
        {typeof reactContent === 'string' || typeof reactContent === 'number' ? (
          <Text>{String(reactContent)}</Text>
        ) : (
          reactContent
        )}
      </MarkdownErrorBoundary>
    </View>
  );
});

MarkdownRendererInner.displayName = 'MarkdownRenderer';

export const MarkdownRenderer = forwardRef<
  MarkdownRendererRef,
  MarkdownRendererProps
>((props, ref) => {
  const { layoutDensity = 'auto', theme } = props;
  const compact = useCompactLayout(layoutDensity);
  // Base theme is Figma Home; only `comfortable` switches to desktop agentic scale.
  const themeProvider = useMemo(
    () =>
      mergeMarkdownThemeOverrides(
        compact ? compactMarkdownTheme : desktopMarkdownTheme,
        theme,
      ),
    [compact, theme],
  );
  return (
    <MarkdownThemeProvider theme={themeProvider}>
      <MarkdownRendererInner ref={ref} {...props} />
    </MarkdownThemeProvider>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
