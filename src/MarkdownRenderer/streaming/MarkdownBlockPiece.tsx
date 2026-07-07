import React, { memo, useMemo, useRef } from 'react';
import { Text } from 'react-native';
import type { Processor } from '../remarkBundle';
import type { MarkdownRnComponentsBundle } from '../buildRnComponents';
import { renderMarkdownBlock } from '../renderMarkdownBlock';
import { withBlockLayout } from '../blockLayout';
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
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const node = useMemo(() => {
    if (processorRef.current !== processor) {
      processorRef.current = processor;
      cacheRef.current.clear();
      lastParsedRef.current = null;
    }

    if (bundleRef.current !== componentBundle) {
      bundleRef.current = componentBundle;
      cacheRef.current.clear();
      lastParsedRef.current = null;
    }

    const bundle = componentBundle;
    const t = themeRef.current;

    const wrap = (inner: React.ReactNode) =>
      withBlockLayout(isFirstBlock, inner);

    if (variant === 'sealed') {
      const cached = cacheRef.current.get(blockSource);
      if (cached) return cached;
      if (lastParsedRef.current?.source === blockSource) {
        const el = lastParsedRef.current.node;
        cacheRef.current.set(blockSource, el);
        return el;
      }
      const el = wrap(
        renderMarkdownBlock(blockSource, processor, bundle, t),
      );
      cacheRef.current.set(blockSource, el);
      return el;
    }

    if (!streaming) {
      const el = wrap(
        renderMarkdownBlock(blockSource, processor, bundle, t),
      );
      lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const stableSource = getStreamingStableMarkdownBlock(blockSource);
    const prev = lastParsedRef.current;

    if (!stableSource.trim() && blockSource.trim()) {
      if (prev?.node) return prev.node;
      return wrap(
        <Text style={t.typography.body}>{blockSource}</Text>,
      );
    }

    if (
      prev &&
      stableSource === prev.source &&
      blockSource !== stableSource
    ) {
      return prev.node;
    }

    if (
      prev &&
      !shouldReparseLastBlock(prev.source, stableSource, true, {
        stableNew: stableSource,
        stablePrev: prev.source,
      })
    ) {
      return prev.node;
    }

    const el = wrap(
      renderMarkdownBlock(stableSource, processor, bundle, t),
    );
    lastParsedRef.current = { source: stableSource, node: el };
    return el;
  }, [
    variant,
    blockSource,
    processor,
    componentBundle,
    streaming,
    isFirstBlock,
  ]);

  return <>{node}</>;
});
