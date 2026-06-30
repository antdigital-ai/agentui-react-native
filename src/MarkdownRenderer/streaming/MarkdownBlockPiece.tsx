import React, { memo, useMemo, useRef } from 'react';
import type { Processor } from '../remarkBundle';
import type { MarkdownRnComponentsBundle } from '../buildRnComponents';
import { renderMarkdownBlock } from '../renderMarkdownBlock';
import type { MarkdownTheme } from '../../theme/defaultTheme';
import { shouldReparseLastBlock } from './lastBlockThrottle';
import { getStreamingStableMarkdownBlock } from './stableTailMarkdown';

export interface MarkdownBlockPieceProps {
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  componentBundle: MarkdownRnComponentsBundle;
  isFirstBlock: boolean;
  streaming: boolean;
  theme: MarkdownTheme;
}

export const MarkdownBlockPiece = memo(function MarkdownBlockPiece({
  variant,
  blockSource,
  processor,
  componentBundle,
  isFirstBlock,
  streaming,
  theme,
}: MarkdownBlockPieceProps) {
  const lastParsedRef = useRef<{
    source: string;
    node: React.ReactNode;
  } | null>(null);
  const cacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  const processorRef = useRef<Processor | null>(null);
  const bundleRef = useRef(componentBundle);
  bundleRef.current = componentBundle;
  const isFirstBlockRef = useRef(isFirstBlock);
  isFirstBlockRef.current = isFirstBlock;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const node = useMemo(() => {
    if (processorRef.current !== processor) {
      processorRef.current = processor;
      cacheRef.current.clear();
      lastParsedRef.current = null;
    }

    const bundle = bundleRef.current;
    const t = themeRef.current;
    const firstBlock = isFirstBlockRef.current;

    if (variant === 'sealed') {
      const cached = cacheRef.current.get(blockSource);
      if (cached) return cached;
      if (lastParsedRef.current?.source === blockSource) {
        const el = lastParsedRef.current.node;
        cacheRef.current.set(blockSource, el);
        return el;
      }
      const el = renderMarkdownBlock(blockSource, processor, bundle, t, {
        isFirstBlock: firstBlock,
      });
      cacheRef.current.set(blockSource, el);
      return el;
    }

    if (!streaming) {
      const el = renderMarkdownBlock(blockSource, processor, bundle, t, {
        isFirstBlock: firstBlock,
      });
      lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const stableSource = getStreamingStableMarkdownBlock(blockSource);
    const prev = lastParsedRef.current;

    if (
      prev &&
      stableSource === prev.source &&
      blockSource !== stableSource
    ) {
      return prev.node;
    }

    if (prev && !shouldReparseLastBlock(prev.source, stableSource, true)) {
      return prev.node;
    }

    const el = renderMarkdownBlock(stableSource, processor, bundle, t, {
      isFirstBlock: firstBlock,
    });
    lastParsedRef.current = { source: stableSource, node: el };
    return el;
  }, [variant, blockSource, processor, streaming, isFirstBlock]);

  return <>{node}</>;
});
