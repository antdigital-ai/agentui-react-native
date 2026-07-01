import { endsInsideGfmTable } from './gfmTableLine';
import { endsInsideUnclosedFence } from './fenceTracker';
import { getStreamingStableMarkdownBlock } from './stableTailMarkdown';

const LAST_BLOCK_THROTTLE_CHARS = 32;
const BLOCK_BOUNDARY_TRIGGERS = /[\n`|>*!~]/;
const TABLE_STREAMING_BOUNDARY_TRIGGERS = /[\n#>*!~]/;
const INLINE_CONTEXT_TRIGGERS = /(?:^|\s)[$[<_]/;

export type ShouldReparseLastBlockOptions = {
  /** When callers already computed stable markdown (avoids duplicate scans). */
  stableNew?: string;
  stablePrev?: string;
};

export const shouldReparseLastBlock = (
  prevParsedSource: string | undefined,
  newSource: string,
  streaming: boolean,
  options?: ShouldReparseLastBlockOptions,
): boolean => {
  if (!streaming) return true;
  if (!prevParsedSource) return true;
  if (newSource.length < prevParsedSource.length) return true;
  if (!newSource.startsWith(prevParsedSource)) return true;
  if (endsInsideUnclosedFence(newSource)) return true;

  const stableNew =
    options?.stableNew ?? getStreamingStableMarkdownBlock(newSource);
  const stablePrev =
    options?.stablePrev ??
    (prevParsedSource !== undefined
      ? getStreamingStableMarkdownBlock(prevParsedSource)
      : undefined);

  if (stablePrev !== undefined && stableNew === stablePrev && stableNew !== newSource) {
    return false;
  }

  const comparePrev = stablePrev ?? prevParsedSource;
  const compareNew = stableNew || newSource;
  if (compareNew === comparePrev && compareNew !== newSource) return false;

  const added = compareNew.slice(comparePrev.length);
  if (added.length >= LAST_BLOCK_THROTTLE_CHARS) return true;
  if (endsInsideGfmTable(compareNew)) {
    if (TABLE_STREAMING_BOUNDARY_TRIGGERS.test(added)) return true;
    if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
    return false;
  }
  if (BLOCK_BOUNDARY_TRIGGERS.test(added)) return true;
  if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
  return false;
};
