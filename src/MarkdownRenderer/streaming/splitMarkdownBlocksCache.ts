import { splitMarkdownBlocks } from './splitMarkdownBlocks';

export type MarkdownBlocksSplitCache = {
  content: string;
  blocks: string[];
};

/** Only incremental-split when line count is high (streaming append to tail). */
const INCREMENTAL_SPLIT_MIN_LINES = 256;

function suffixIntroducesBlockBoundary(suffix: string): boolean {
  return /\n\s*\n/.test(suffix);
}

/**
 * Split markdown into blocks; reuse prior result when content only grows at the end
 * without a new blank-line paragraph boundary in the suffix.
 */
export function splitMarkdownBlocksWithCache(
  content: string,
  cache: MarkdownBlocksSplitCache | undefined,
): MarkdownBlocksSplitCache {
  if (cache?.content === content) {
    return cache;
  }

  if (!content) {
    return { content: '', blocks: [''] };
  }

  if (
    cache?.content &&
    content.startsWith(cache.content) &&
    cache.blocks.length > 0
  ) {
    const suffix = content.slice(cache.content.length);
    const lineCount = content.split('\n').length;

    if (
      lineCount >= INCREMENTAL_SPLIT_MIN_LINES &&
      suffix.length > 0 &&
      !suffixIntroducesBlockBoundary(suffix)
    ) {
      const headBlocks = cache.blocks.slice(0, -1);
      const lastBlockSource = cache.blocks[cache.blocks.length - 1] + suffix;
      const tailBlocks = splitMarkdownBlocks(lastBlockSource);
      return {
        content,
        blocks: [...headBlocks, ...tailBlocks],
      };
    }
  }

  return {
    content,
    blocks: splitMarkdownBlocks(content),
  };
}
