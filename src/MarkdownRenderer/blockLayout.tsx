import React, { createContext, useContext } from 'react';
import type { HeadingLevel } from '../theme/headingMargins';

export type BlockLayoutState = {
  paragraphIndex: number;
  isFirstBlockInDocument: boolean;
  sectionHeadingIndex: Partial<Record<HeadingLevel, number>>;
};

export function createBlockLayoutState(
  isFirstBlockInDocument: boolean,
): BlockLayoutState {
  return {
    paragraphIndex: 0,
    isFirstBlockInDocument,
    sectionHeadingIndex: {},
  };
}

export const BlockLayoutContext = createContext<BlockLayoutState | null>(null);

export function useBlockLayout(): BlockLayoutState {
  const layout = useContext(BlockLayoutContext);
  if (!layout) {
    throw new Error(
      'Markdown block layout requires BlockLayoutContext (wrap with MarkdownBlockPiece or markdownToReactSync)',
    );
  }
  return layout;
}

export function withBlockLayout(
  isFirstBlockInDocument: boolean,
  node: React.ReactNode,
): React.ReactNode {
  const layout = createBlockLayoutState(isFirstBlockInDocument);
  return (
    <BlockLayoutContext.Provider value={layout}>
      {node}
    </BlockLayoutContext.Provider>
  );
}
