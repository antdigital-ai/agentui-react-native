import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { View } from 'react-native';
import { MarkdownThemeProvider } from '../theme/MarkdownThemeProvider';
import { compactMarkdownTheme, mergeMarkdownThemeOverrides } from '../theme/mobileTheme';
import { useCompactLayout } from '../theme/useCompactLayout';
import type {
  MarkdownRendererProps,
  MarkdownRendererRef,
} from './types';
import { useContentThrottle } from './useContentThrottle';
import { useMarkdownToReact } from './useStreamingMarkdownReact';

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
    testID = 'markdown-renderer',
  } = props;

  const sourceText = content || '';
  const throttleEnabled = streaming && throttleOptions?.enabled !== false;

  const displayedText = useContentThrottle(
    sourceText,
    throttleEnabled,
    throttleOptions,
    isFinished,
  );

  useImperativeHandle(ref, () => ({
    getDisplayedContent: () => displayedText,
  }));

  const reactContent = useMarkdownToReact(displayedText, {
    remarkPlugins,
    linkConfig,
    streaming,
    components,
    eleRender,
    contentRevisionSource: streaming ? sourceText : undefined,
  });

  return (
    <View testID={testID} style={style}>
      {reactContent}
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
  const themeProvider = useMemo(
    () =>
      mergeMarkdownThemeOverrides(
        compact ? compactMarkdownTheme : undefined,
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
