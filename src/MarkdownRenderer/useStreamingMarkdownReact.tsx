import React, { useMemo, useRef, useState } from 'react';
import { Text } from 'react-native';
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

const EMPTY_BLOCKS: string[] = [];

interface RevisionState {
  prevRevision: string | undefined;
  generation: number;
}

const INITIAL_REVISION_STATE: RevisionState = {
  prevRevision: undefined,
  generation: 0,
};

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

  const [revisionState, setRevisionState] = useState<RevisionState>(
    INITIAL_REVISION_STATE,
  );

  let nextPrevRevision = revisionState.prevRevision;
  let nextGeneration = revisionState.generation;

  if (!content) {
    nextPrevRevision = '';
  } else {
    if (
      revisionState.prevRevision !== undefined &&
      shouldResetRevisionProgress(revisionState.prevRevision, revisionSource)
    ) {
      nextGeneration = revisionState.generation + 1;
    }
    nextPrevRevision = revisionSource;
  }

  if (
    nextPrevRevision !== revisionState.prevRevision ||
    nextGeneration !== revisionState.generation
  ) {
    setRevisionState({
      prevRevision: nextPrevRevision,
      generation: nextGeneration,
    });
  }

  const generation = nextGeneration;

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

  const visibleCount = useProgressiveBlocks(
    blocks.length,
    !!options?.streaming,
    generation,
  );

  return useMemo(() => {
    if (blocks.length === 0) {
      if (content.trim()) {
        return <Text style={theme.typography.body}>{content}</Text>;
      }
      return null;
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

    return <>{elements}</>;
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
