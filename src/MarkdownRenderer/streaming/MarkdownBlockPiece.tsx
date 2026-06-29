import React, { memo, useMemo, useRef } from 'react';
import type { Processor } from '../remarkBundle';
import { renderMarkdownBlock } from '../renderMarkdownBlock';
import type { MarkdownTheme } from '../../theme/defaultTheme';
import type { RendererBlockProps } from '../types';
import { shouldReparseLastBlock } from './lastBlockThrottle';

export interface MarkdownBlockPieceProps {
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  components: Record<string, React.ComponentType<RendererBlockProps>>;
  streaming: boolean;
  theme: MarkdownTheme;
}

export const MarkdownBlockPiece = memo(function MarkdownBlockPiece({
  variant,
  blockSource,
  processor,
  components,
  streaming,
  theme,
}: MarkdownBlockPieceProps) {
  const lastParsedRef = useRef<{
    source: string;
    node: React.ReactNode;
  } | null>(null);
  const cacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  const processorRef = useRef<Processor | null>(null);
  const componentsRef = useRef(components);
  componentsRef.current = components;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const node = useMemo(() => {
    if (processorRef.current !== processor) {
      processorRef.current = processor;
      cacheRef.current.clear();
      lastParsedRef.current = null;
    }

    const comps = componentsRef.current;
    const t = themeRef.current;

    if (variant === 'sealed') {
      const cached = cacheRef.current.get(blockSource);
      if (cached) return cached;
      if (lastParsedRef.current?.source === blockSource) {
        const el = lastParsedRef.current.node;
        cacheRef.current.set(blockSource, el);
        return el;
      }
      const el = renderMarkdownBlock(blockSource, processor, comps, t);
      cacheRef.current.set(blockSource, el);
      return el;
    }

    if (!streaming) {
      const el = renderMarkdownBlock(blockSource, processor, comps, t);
      lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const prev = lastParsedRef.current;
    if (prev && !shouldReparseLastBlock(prev.source, blockSource, true)) {
      return prev.node;
    }

    const el = renderMarkdownBlock(blockSource, processor, comps, t);
    lastParsedRef.current = { source: blockSource, node: el };
    return el;
  }, [variant, blockSource, processor, streaming]);

  return <>{node}</>;
});
