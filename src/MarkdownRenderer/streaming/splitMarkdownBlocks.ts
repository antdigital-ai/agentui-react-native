import {
  INITIAL_FENCE_STATE,
  updateFenceStateForLine,
} from './fenceTracker';
import { isGfmTableLine } from './gfmTableLine';

const LIST_ITEM_PATTERN = /^(\s*)([-+*]|\d+[.)]) /;
const BLOCKQUOTE_PATTERN = /^\s*>/;
const HTML_COMMENT_PATTERN = /^\s*<!--/;
const FOOTNOTE_DEF_PATTERN = /^\s*\[\^/;

/** Split on blank lines while keeping fences, lists, blockquotes, and GFM tables contiguous. */
export const splitMarkdownBlocks = (content: string): string[] => {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let fenceState = { ...INITIAL_FENCE_STATE };
  let inList = false;
  let inBlockquote = false;
  let pendingBlankLines = 0;

  const lastNonEmptyLine = (): string => {
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i] !== '') return current[i];
    }
    return '';
  };

  for (const line of lines) {
    fenceState = updateFenceStateForLine(fenceState, line);

    if (fenceState.inFenced) {
      if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    if (line === '') {
      if (current.length > 0) pendingBlankLines++;
      continue;
    }

    if (pendingBlankLines > 0) {
      const nextIsListItem = LIST_ITEM_PATTERN.test(line);
      const nextIsBlockquote = BLOCKQUOTE_PATTERN.test(line);
      const nextIsContinuation =
        (inList && (nextIsListItem || /^\s+\S/.test(line))) ||
        (inBlockquote && nextIsBlockquote);

      const prevIsHtmlComment = HTML_COMMENT_PATTERN.test(lastNonEmptyLine());
      const nextIsFootnoteDef = FOOTNOTE_DEF_PATTERN.test(line);

      if (
        current.length > 0 &&
        !nextIsContinuation &&
        !prevIsHtmlComment &&
        !nextIsFootnoteDef
      ) {
        blocks.push(current.join('\n'));
        current = [];
        inList = false;
        inBlockquote = false;
      } else {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
      }
      pendingBlankLines = 0;
    }

    inList = LIST_ITEM_PATTERN.test(line) || (inList && /^\s+\S/.test(line));
    inBlockquote = BLOCKQUOTE_PATTERN.test(line);

    if (
      current.length > 0 &&
      isGfmTableLine(line) &&
      !isGfmTableLine(lastNonEmptyLine()) &&
      !HTML_COMMENT_PATTERN.test(lastNonEmptyLine())
    ) {
      blocks.push(current.join('\n'));
      current = [];
      inList = false;
      inBlockquote = false;
    }

    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current.join('\n'));
  }
  if (blocks.length === 0) {
    blocks.push('');
  }
  return blocks;
};
