const TABLE_ROW_PATTERN = /^\s*\|.+\|\s*$/;
const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const HEADING_PATTERN = /^#{1,6}\s+/;
/** One GFM table row (header, separator, or data), e.g. `| a | b |`. */
const COMPLETE_TABLE_ROW_PREFIX = /^(\|(?:[^|\n]+\|)+)/;

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return TABLE_ROW_PATTERN.test(trimmed) || TABLE_SEPARATOR_PATTERN.test(trimmed);
}

function isCompleteTableRowSegment(segment: string): boolean {
  const trimmed = segment.trim();
  return TABLE_ROW_PATTERN.test(trimmed) || TABLE_SEPARATOR_PATTERN.test(trimmed);
}

function hasConcatenatedTableRows(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || trimmed.includes('`')) {
    return false;
  }
  const firstRow = trimmed.match(COMPLETE_TABLE_ROW_PREFIX);
  if (!firstRow?.[1]) {
    return false;
  }
  const rest = trimmed.slice(firstRow[1].length).trimStart();
  return rest.startsWith('|');
}

/**
 * LLM output often glues multiple table rows on one line:
 * `| a | b | | c | d |` or `| a | b ||---|` or `| a | b |### next`.
 */
function splitConcatenatedTableRowsOnLine(line: string): string {
  if (!line.includes('|') || line.includes('`')) {
    return line;
  }

  let working = line;
  if (/\|[^|\n]*\|\s*#{1,6}/.test(working)) {
    working = working.replace(/(\|)\s*(#{1,6})/g, '$1\n\n$2');
  }

  if (!hasConcatenatedTableRows(working)) {
    return working;
  }

  const leadingWhitespace = working.match(/^\s*/)?.[0] ?? '';
  let remaining = working.trimStart();
  const rows: string[] = [];

  while (remaining.length > 0) {
    if (remaining.startsWith('|')) {
      const match = remaining.match(COMPLETE_TABLE_ROW_PREFIX);
      if (match?.[1] && isCompleteTableRowSegment(match[1])) {
        rows.push(match[1].trim());
        remaining = remaining.slice(match[1].length).trimStart();
        continue;
      }
    }

    const nextPipe = remaining.indexOf('|');
    if (nextPipe === -1) {
      const tail = remaining.trim();
      if (tail.length > 0) {
        rows.push(tail);
      }
      break;
    }
    if (nextPipe > 0) {
      rows.push(remaining.slice(0, nextPipe).trimEnd());
      remaining = remaining.slice(nextPipe).trimStart();
      continue;
    }

    rows.push(remaining);
    break;
  }

  if (rows.length <= 1) {
    return working;
  }

  return leadingWhitespace + rows.join('\n');
}

function splitGluedTableRow(line: string): string {
  if (HEADING_PATTERN.test(line)) {
    return line;
  }

  if (isTableRow(line) && !hasConcatenatedTableRows(line)) {
    return line;
  }

  const match = line.match(/^(.+?)(\|\s*.+\|\s*)$/);
  if (!match) {
    return line;
  }

  const [, prefix, tablePart] = match;
  if (!prefix || !tablePart || prefix.includes('`')) {
    return line;
  }

  return `${prefix.trimEnd()}\n\n${tablePart.trimStart()}`;
}

function ensureBlankLineBeforeTables(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const previousLine = result.length > 0 ? result[result.length - 1] : '';
    const previousIsBlank = previousLine.trim() === '';
    const previousIsTable = isTableRow(previousLine);

    if (isTableRow(line) && !previousIsBlank && !previousIsTable) {
      result.push('');
    }

    result.push(line);
  }

  return result.join('\n');
}

function repairGluedTableRowsGlobal(text: string): string {
  return text.replace(
    /(\|(?:[^|\n]+\|)+)\s*(?=\|)/g,
    '$1\n',
  );
}

function normalizeTableMarkdown(text: string): string {
  let result = text;
  result = repairGluedTableRowsGlobal(result);
  result = result.split('\n').map(splitConcatenatedTableRowsOnLine).join('\n');
  result = result.split('\n').map(splitGluedTableRow).join('\n');
  result = repairHeadingHashSpacing(result);
  result = result.replace(/^(#{1,6}\s+[^\n|]+?)(\|)/gm, '$1\n\n$2');
  result = ensureBlankLineBeforeTables(result);
  return result;
}

function stripFinalMarkerTail(content: string): string {
  const markerIndex = content.indexOf('[final]');
  if (markerIndex === -1) {
    return content;
  }

  return content.slice(0, markerIndex).trimEnd();
}

function tailLooksLikeMarkdownBlock(content: string): boolean {
  return /(^|\n)#{1,6}\s/m.test(content) || /(^|\n)\s*\|[^\n]+\|/m.test(content);
}

const FENCE_LINE_PATTERN = /^(`{3,}|~{3,})(.*)$/;

/** ` ``` ---` is a glued HR, not a fenced code block opener. */
function repairSpuriousFenceLines(text: string): string {
  return text.split('\n').map(line => {
    const match = line.match(FENCE_LINE_PATTERN);
    if (!match) {
      return line;
    }
    const after = match[2].trim();
    if (/^-+$/.test(after)) {
      return '---';
    }
    return line;
  }).join('\n');
}

function repairUnclosedFencedCodeBlocks(text: string, streaming = false): string {
  const lines = text.split('\n');
  let inFenced = false;
  let openIndex = -1;
  let closingFence = '';

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(FENCE_LINE_PATTERN);
    if (!match) {
      continue;
    }

    const fence = match[1];
    const char = fence[0];
    const len = fence.length;
    const after = match[2];

    if (!inFenced) {
      inFenced = true;
      openIndex = i;
      closingFence = char.repeat(len);
      continue;
    }

    if (char === closingFence[0] && len >= closingFence.length && /^\s*$/.test(after)) {
      inFenced = false;
      openIndex = -1;
      closingFence = '';
    }
  }

  if (!inFenced) {
    return lines.join('\n');
  }

  if (streaming) {
    return lines.join('\n');
  }

  const tail = lines.slice(openIndex + 1).join('\n');
  if (tailLooksLikeMarkdownBlock(tail)) {
    const openerMatch = lines[openIndex].match(FENCE_LINE_PATTERN);
    const rest = openerMatch?.[2].trim() ?? '';
    if (rest.length > 0) {
      lines[openIndex] = rest;
    } else {
      lines.splice(openIndex, 1);
    }
    return lines.join('\n');
  }

  return `${lines.join('\n')}\n${closingFence}`;
}

function repairHeadingHashSpacing(text: string): string {
  let result = text.replace(
    /(^|[^\n#|`])(#{1,6})(\d+)(?!\d)/gm,
    '$1$2 $3',
  );
  result = result.replace(
    /(^|[^\n#|`])(#{1,6})([^\s#\d\n])/gm,
    '$1$2 $3',
  );
  return result;
}

const GLUED_HEADING_CJK_BEFORE = '[\\u4e00-\\u9fff：，。；！？）】》、]';

function repairHeadingGluedToPrecedingText(text: string): string {
  let result = text.replace(/([^\n#|`])(#{1,6})(?=\s)/g, '$1\n\n$2');
  result = result.replace(
    new RegExp(`(${GLUED_HEADING_CJK_BEFORE})(#{1,6})`, 'g'),
    '$1\n\n$2',
  );
  return result;
}

function ensureBlankLineBeforeHeadings(text: string): string {
  return text.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
}

function repairGluedHeadings(text: string): string {
  let result = text;
  let previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(/(#{1,6}\s+[^#\n]+?)(#{1,6})/g, '$1\n\n$2');
  }
  return result;
}

function repairFenceGluedToFollowingBlock(text: string): string {
  return text
    .replace(/(`{3,}|~{3,})([ \t]*)(#{1,6})/g, '$1\n\n$3')
    .replace(/(`{3,}|~{3,})([ \t]*)(\|)/g, '$1\n\n$3');
}

function repairOpeningFenceGluedToPrecedingText(text: string): string {
  return text.replace(/([^\n` \t])(`{3,}|~{3,})/g, '$1\n\n$2');
}

interface MarkdownLineContext {
  inFenced: boolean;
}

const LIST_LINE_START_PATTERN = /^[ \t]*(?:[-+*]|•)\s+/;

const GLUED_SIBLING_OPTION_LABEL =
  '(?:\\*\\*[A-Za-z]\\.\\*\\*|(?:[A-Za-z]|\\d{1,2}|[一二三四五六七八九十]{1,3})[\\.．、])\\s*';

const GLUED_LIST_GLUE_BEFORE = '[)）A-Za-z_\\u4e00-\\u9fff]';

const GLUED_LIST_ITEM_SPLIT_PATTERN = new RegExp(
  `(${GLUED_LIST_GLUE_BEFORE})\\s+[-\\u2013\\u2014]\\s+(${GLUED_SIBLING_OPTION_LABEL})`,
  'g',
);

function mapMarkdownLinesOutsideFences(
  text: string,
  mapLine: (line: string, ctx: MarkdownLineContext) => string,
): string {
  const lines = text.split('\n');
  let inFenced = false;
  let closingFence = '';

  return lines.map((line) => {
    const mapped = mapLine(line, { inFenced });

    const match = line.match(FENCE_LINE_PATTERN);
    if (match) {
      const fence = match[1];
      const char = fence[0];
      const len = fence.length;
      const after = match[2];

      if (!inFenced) {
        inFenced = true;
        closingFence = char.repeat(len);
      } else if (char === closingFence[0] && len >= closingFence.length && /^\s*$/.test(after)) {
        inFenced = false;
        closingFence = '';
      }
    }

    return mapped;
  }).join('\n');
}

function normalizeUnicodeBulletMarkerOnLine(line: string): string {
  return line.replace(/^([ \t]*)•\s/, '$1- ');
}

function repairUnorderedListMarkerSpacingOnLine(line: string): string {
  return line.replace(/^([ \t]*[-+])(?![-+\s])(?=\S)/, '$1 ');
}

function repairOrderedListMarkerSpacingOnLine(line: string): string {
  return line.replace(/^([ \t]*\d+\.)(?!\s)([^\d\n])/, '$1 $2');
}

function repairBoldBoundarySpacingOnLine(line: string): string {
  if (line.includes('`')) {
    return line;
  }
  return line.replace(
    /\*\*([^*\n]+?)\*\*(?=[A-Za-z0-9\u4e00-\u9fff\u{1F534}\u{1F7E1}\u2705\u274C])/gu,
    '**$1** ',
  );
}

function repairEmojiSectionHeadingSpacingOnLine(line: string): string {
  if (line.includes('`')) {
    return line;
  }
  return line.replace(
    /^(\d+(?:\uFE0F?\u20E3|️⃣)+)([\u4e00-\u9fffA-Za-z])/u,
    '$1 $2',
  );
}

const EMOJI_CLUSTER_SOURCE = '\\p{Extended_Pictographic}(?:[\\u{1F3FB}-\\u{1F3FF}\\uFE0F\\u20E3]|\\u200D\\p{Extended_Pictographic})*';

function mapSegmentsOutsideInlineCode(line: string, mapSegment: (segment: string) => string): string {
  const parts = line.split(/(`[^`\n]+`)/g);
  return parts.map((part, index) => (index % 2 === 1 ? part : mapSegment(part))).join('');
}

function repairCjkLatinBoundarySpacingSegment(text: string): string {
  let result = text;
  result = result.replace(/(?<=[\p{L}\p{N})\]}])(?<![—–])([—–])(?![—–])/gu, ' $1');
  result = result.replace(/(?<![—–])([—–])(?![—–])(?=[\p{L}\p{N}])/gu, '$1 ');
  result = result.replace(/(?<=[\u4e00-\u9fff])-\s*(?=[A-Za-z_\u4e00-\u9fff])/g, ' — ');
  result = result.replace(/([\u4e00-\u9fff])(?=[A-Za-z_][\w./()-]*)/g, '$1 ');
  result = result.replace(/(?<=[A-Za-z_)\]}])(?=[\u4e00-\u9fff])/g, ' ');
  return result;
}

function repairBoldMarkerInternalSpacingSegment(text: string): string {
  let result = text;
  const openBold = '\\*\\*(?!\\s*\\|)';
  result = result.replace(new RegExp(`${openBold}\\s+([^*\\n]+?)\\s+\\*\\*`, 'g'), '**$1**');
  result = result.replace(new RegExp(`${openBold}\\s+([^*\\n]+?)\\*\\*`, 'g'), '**$1**');
  result = result.replace(new RegExp(`${openBold}([^*\\n]+?)\\s+\\*\\*`, 'g'), '**$1**');
  return result;
}

function repairBoldMarkerInternalSpacingOnLine(line: string): string {
  return mapSegmentsOutsideInlineCode(line, repairBoldMarkerInternalSpacingSegment);
}

const STRONG_WITH_SPECIAL_CHARS_PATTERN =
  /\*\*([^*\n]*[$%#@&+\-=\d.，。、；：！？""''（）【】《》\u4e00-\u9fff]+[^*\n]*?)\*\*/g;

function repairStrongWithSpecialCharsSegment(text: string): string {
  return text.replace(STRONG_WITH_SPECIAL_CHARS_PATTERN, '<strong>$1</strong>');
}

function repairStrongWithSpecialCharsOnLine(line: string): string {
  return mapSegmentsOutsideInlineCode(line, repairStrongWithSpecialCharsSegment);
}

function repairCjkLatinBoundarySpacingOnLine(line: string): string {
  return mapSegmentsOutsideInlineCode(line, repairCjkLatinBoundarySpacingSegment);
}

function repairEmojiContentSpacingOnLine(line: string): string {
  return mapSegmentsOutsideInlineCode(line, (segment) => {
    let result = segment.replace(
      new RegExp(`(${EMOJI_CLUSTER_SOURCE})(?=[\\p{L}\\p{N}])`, 'gu'),
      '$1 ',
    );
    result = result.replace(
      new RegExp(`(?<=[\\p{L}\\p{N}])(${EMOJI_CLUSTER_SOURCE})`, 'gu'),
      ' $1',
    );
    return result;
  });
}

function splitGluedListItemsOnLine(line: string): string {
  if (!LIST_LINE_START_PATTERN.test(line)) {
    return line;
  }

  let result = line;
  let previous = '';
  while (result !== previous) {
    previous = result;
    result = result.replace(GLUED_LIST_ITEM_SPLIT_PATTERN, '$1\n- $2');
  }
  return result;
}

function stripTrailingHorizontalRuleOnListLine(line: string): string {
  if (!LIST_LINE_START_PATTERN.test(line)) {
    return line;
  }

  const match = line.match(/^([ \t]*(?:[-+*]|•)\s+.+\S?)[-\u2013\u2014]{3,}\s*$/);
  return match?.[1]?.trimEnd() ?? line;
}

function repairListLineOnLine(line: string): string {
  let result = normalizeUnicodeBulletMarkerOnLine(line);
  result = repairUnorderedListMarkerSpacingOnLine(result);
  result = repairOrderedListMarkerSpacingOnLine(result);
  result = repairEmojiSectionHeadingSpacingOnLine(result);
  result = splitGluedListItemsOnLine(result);
  result = repairBoldBoundarySpacingOnLine(result);
  result = repairEmojiContentSpacingOnLine(result);
  result = stripTrailingHorizontalRuleOnListLine(result);
  result = repairCjkLatinBoundarySpacingOnLine(result);
  result = repairBoldMarkerInternalSpacingOnLine(result);
  result = repairStrongWithSpecialCharsOnLine(result);
  return result;
}

function repairListMarkdown(text: string): string {
  return mapMarkdownLinesOutsideFences(text, (line, ctx) => {
    if (ctx.inFenced) {
      return line;
    }
    return repairListLineOnLine(line);
  });
}

function ensureBlankLinesAroundFences(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inFenced = false;
  let closingFence = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(FENCE_LINE_PATTERN);

    if (match) {
      const fence = match[1];
      const char = fence[0];
      const len = fence.length;
      const after = match[2];

      if (!inFenced) {
        const previousLine = result.length > 0 ? result[result.length - 1] : '';
        if (previousLine.trim() !== '') {
          result.push('');
        }
        result.push(line);
        inFenced = true;
        closingFence = char.repeat(len);
        continue;
      }

      if (char === closingFence[0] && len >= closingFence.length && /^\s*$/.test(after)) {
        result.push(line);
        inFenced = false;
        closingFence = '';
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        if (nextLine.trim() !== '') {
          result.push('');
        }
        continue;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

function repairSpuriousFenceLine(line: string): string {
  const match = line.match(FENCE_LINE_PATTERN);
  if (!match) {
    return line;
  }
  const after = match[2].trim();
  if (/^-+$/.test(after)) {
    return '---';
  }
  return line;
}

/** Single-pass line repairs used while SSE is still in flight. */
function repairStreamingLine(line: string, ctx: MarkdownLineContext): string {
  if (ctx.inFenced) {
    return line;
  }
  let result = repairSpuriousFenceLine(line);
  result = repairListLineOnLine(result);
  result = splitConcatenatedTableRowsOnLine(result);
  result = splitGluedTableRow(result);
  return result;
}

/**
 * Lightweight normalize for active streaming tails.
 * Merges list/table/fence line repairs into one scan; defers heavy global
 * repairs (glued headings, fence closing, etc.) until the stream finishes.
 */
export function normalizeStreamingMarkdownLight(content: string): string {
  if (!content) {
    return content;
  }

  let text = stripFinalMarkerTail(content);
  text = text.replace(/(---[ \t]*)(#{1,6})(?![#])/g, '$1\n\n$2');
  text = repairOpeningFenceGluedToPrecedingText(text);
  text = mapMarkdownLinesOutsideFences(text, repairStreamingLine);
  text = repairHeadingGluedToPrecedingText(text);
  text = ensureBlankLineBeforeHeadings(text);
  text = repairHeadingHashSpacing(text);
  text = repairGluedTableRowsGlobal(text);
  text = text.replace(/^(#{1,6}\s+[^\n|]+?)(\|)/gm, '$1\n\n$2');
  text = ensureBlankLineBeforeTables(text);
  text = ensureBlankLinesAroundFences(text);
  return repairUnclosedFencedCodeBlocks(text, true);
}

export interface NormalizeChatMarkdownOptions {
  /** Apply streaming-safe repairs (unclosed fences, etc.). */
  streaming?: boolean;
}

/**
 * Normalizes assistant markdown before rendering.
 * Fixes common LLM formatting issues that break GFM table / fence parsing.
 */
export function normalizeChatMarkdown(
  content: string,
  options: NormalizeChatMarkdownOptions = {},
): string {
  if (!content) {
    return content;
  }

  if (options.streaming) {
    return normalizeStreamingMarkdownLight(content);
  }

  let text = stripFinalMarkerTail(content);

  text = text.replace(/(---[ \t]*)(#{1,6})(?![#])/g, '$1\n\n$2');
  text = repairSpuriousFenceLines(text);
  text = repairOpeningFenceGluedToPrecedingText(text);
  text = repairFenceGluedToFollowingBlock(text);
  text = repairListMarkdown(text);
  text = repairGluedHeadings(text);
  text = repairHeadingGluedToPrecedingText(text);
  text = ensureBlankLineBeforeHeadings(text);
  text = text.replace(/(^#{1,6}\s+[^\n#]+?)(基于)/gm, '$1\n\n$2');
  text = repairHeadingHashSpacing(text);
  text = normalizeTableMarkdown(text);
  text = ensureBlankLinesAroundFences(text);

  return repairUnclosedFencedCodeBlocks(text, false);
}
