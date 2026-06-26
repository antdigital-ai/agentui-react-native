import { endsInsideGfmTable } from './gfmTableLine';
import { endsInsideUnclosedFence } from './fenceTracker';

const LAST_BLOCK_THROTTLE_CHARS = 20;
const BLOCK_BOUNDARY_TRIGGERS = /[\n`|#>*\-!~]/;
const TABLE_STREAMING_BOUNDARY_TRIGGERS = /[\n#>*!~]/;
const INLINE_CONTEXT_TRIGGERS = /(?:^|\s)[$[<_]/;

export const shouldReparseLastBlock = (
  prevParsedSource: string | undefined,
  newSource: string,
  streaming: boolean,
): boolean => {
  if (!streaming) return true;
  if (!prevParsedSource) return true;
  if (newSource.length < prevParsedSource.length) return true;
  if (!newSource.startsWith(prevParsedSource)) return true;
  if (endsInsideUnclosedFence(newSource)) return true;
  const added = newSource.slice(prevParsedSource.length);
  if (added.length >= LAST_BLOCK_THROTTLE_CHARS) return true;
  if (endsInsideGfmTable(newSource)) {
    if (TABLE_STREAMING_BOUNDARY_TRIGGERS.test(added)) return true;
    if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
    return false;
  }
  if (BLOCK_BOUNDARY_TRIGGERS.test(added)) return true;
  if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
  return false;
};
