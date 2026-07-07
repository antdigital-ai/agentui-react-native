import React, { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { createHastProcessor } from './processor';
import { buildRnComponents } from './buildRnComponents';
import { useMarkdownThemeWithOverride } from '../theme/MarkdownThemeProvider';
import type {
  RendererBlockProps,
  UseMarkdownToReactOptions,
} from './types';
import { splitMarkdownBlocksWithCache } from './streaming/splitMarkdownBlocksCache';
import type { MarkdownBlocksSplitCache } from './streaming/splitMarkdownBlocksCache';
import { MarkdownBlockPiece } from './streaming/MarkdownBlockPiece';
import { shouldResetRevisionProgress } from './streaming/revisionPolicy';
import { useProgressiveBlocks } from './streaming/useProgressiveBlocks';
import { useShallowMemo } from './streaming/useShallowMemo';
import { isPlainMarkdownText } from './plainText';

const EMPTY_BLOCKS: string[] = [];

export function useStreamingMarkdownReact(
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode {
  const theme = useMarkdownThemeWithOverride(options?.theme);
  const revisionSource =
    options?.contentRevisionSource !== undefined
      ? options.contentRevisionSource
      : content;

  const processor = useMemo(
    () => createHastProcessor(options?.remarkPlugins),
    [options?.remarkPlugins],
  );

  const stableComponents = useShallowMemo(options?.components);
  const componentBundle = useMemo(
    () =>
      buildRnComponents({
        theme,
        linkConfig: options?.linkConfig,
        eleRender: options?.eleRender,
        userComponents: (stableComponents || {}) as Record<
          string,
          React.ComponentType<RendererBlockProps>
        >,
      }),
    [theme, options?.linkConfig, options?.eleRender, stableComponents],
  );

  const revisionTrackerRef = useRef<{ prev?: string; generation: number }>({
    generation: 0,
  });

  const generation = useMemo(() => {
    const tracker = revisionTrackerRef.current;
    if (!content) {
      tracker.prev = '';
      return tracker.generation;
    }
    if (
      tracker.prev !== undefined &&
      shouldResetRevisionProgress(tracker.prev, revisionSource)
    ) {
      tracker.generation += 1;
    }
    tracker.prev = revisionSource;
    return tracker.generation;
  }, [content, revisionSource]);

  const splitCacheRef = useRef<MarkdownBlocksSplitCache | undefined>(undefined);
  const splitGenerationRef = useRef(generation);

  const blocks = useMemo(() => {
    if (!content) return EMPTY_BLOCKS;
    if (splitGenerationRef.current !== generation) {
      splitGenerationRef.current = generation;
      splitCacheRef.current = undefined;
    }
    try {
      const next = splitMarkdownBlocksWithCache(content, splitCacheRef.current);
      splitCacheRef.current = next;
      return next.blocks.length > 0 ? next.blocks : EMPTY_BLOCKS;
    } catch {
      splitCacheRef.current = undefined;
      return EMPTY_BLOCKS;
    }
  }, [content, generation]);

  const visibleCount = useProgressiveBlocks(blocks.length);

  return useMemo(() => {
    if (!content.trim()) {
      return null;
    }

    if (isPlainMarkdownText(content)) {
      return (
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.text },
          ]}
        >
          {content}
        </Text>
      );
    }

    if (blocks.length === 0) {
      return <Text style={theme.typography.body}>{content}</Text>;
    }

    const renderCount = Math.min(visibleCount, blocks.length);
    const elements: React.ReactNode[] = [];

    for (let index = 0; index < renderCount; index++) {
      const blockSource = blocks[index];
      const isLast = index === blocks.length - 1;
      const key = `b-${generation}-${index}`;
      elements.push(
        <MarkdownBlockPiece
          key={key}
          variant={isLast ? 'tail' : 'sealed'}
          blockSource={blockSource}
          processor={processor}
          componentBundle={componentBundle}
          isFirstBlock={index === 0}
          streaming={!!options?.streaming}
          theme={theme}
        />,
      );
    }

    return (
      <View collapsable={false} style={{ width: '100%', alignSelf: 'stretch' }}>
        {elements}
      </View>
    );
  }, [
    blocks,
    generation,
    visibleCount,
    processor,
    componentBundle,
    options?.streaming,
    theme,
    content,
  ]);
}

export const useMarkdownToReact = useStreamingMarkdownReact;
