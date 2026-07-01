import { isIncompleteGfmTableLine } from './gfmTableLine';

const FONT_OPEN = /<font\b/gi;

/** Drop trailing incomplete `<font …>…</font>` so streaming never flashes raw HTML. */
export function trimIncompleteFontMarkup(source: string): string {
  if (!source.includes('<')) return source;

  let cutIndex = source.length;

  FONT_OPEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FONT_OPEN.exec(source)) !== null) {
    const start = match.index;
    const tail = source.slice(start);
    const openTag = tail.match(/^<font\b[^>]*>/i);
    if (!openTag) {
      cutIndex = Math.min(cutIndex, start);
      continue;
    }
    const afterOpen = tail.slice(openTag[0].length);
    if (!/<\/font\s*>/i.test(afterOpen)) {
      cutIndex = Math.min(cutIndex, start);
    }
  }

  let result = source.slice(0, cutIndex);

  const partialTag = result.match(/<(?:\/(?:f(?:o(?:n(?:t)?)?)?)?|(?:f(?:o(?:n(?:t(?:\s[^>]*)?)?)?)?)?)?$/i);
  if (partialTag?.index != null && partialTag[0].length > 0) {
    const frag = partialTag[0];
    const isPartialFont =
      frag === '<' ||
      /^<f(?:o?(?:n?(?:t?(?:\s|$)?)?)?)?$/i.test(frag) ||
      /^<\/?f(?:o?(?:n?(?:t)?)?)?$/i.test(frag) ||
      /^<font\s[^>]*$/i.test(frag);
    if (isPartialFont) {
      result = result.slice(0, partialTag.index);
    }
  }

  return result;
}

type EmphasisDelimiter = '**' | '__';

/** Hide unclosed `**` / `__` emphasis while the closing delimiter is still streaming in. */
function trimIncompleteDelimiterPair(
  source: string,
  delimiter: EmphasisDelimiter,
): string {
  const markLen = delimiter.length;
  const single = delimiter[0];
  if (!source.includes(single)) return source;

  let openIndex: number | null = null;
  let i = 0;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source.slice(i, i + markLen) === delimiter) {
      if (openIndex === null) openIndex = i;
      else openIndex = null;
      i += markLen;
      continue;
    }
    i += 1;
  }

  if (openIndex !== null) {
    return source.slice(0, openIndex);
  }

  if (source.endsWith(single) && !source.endsWith(delimiter)) {
    const idx = source.length - 1;
    if (idx === 0 || source[idx - 1] !== single) {
      return source.slice(0, idx);
    }
  }

  return source;
}

export function trimIncompleteBoldMarkup(source: string): string {
  let result = trimIncompleteDelimiterPair(source, '**');
  result = trimIncompleteDelimiterPair(result, '__');
  return result;
}

/** ATX heading or list item line still being typed (no trailing newline on block). */
export function getStreamingStableMarkdownBlock(source: string): string {
  if (!source) return source;
  if (source.endsWith('\n')) return source;

  const lastNewline = source.lastIndexOf('\n');
  const lastLine = lastNewline === -1 ? source : source.slice(lastNewline + 1);

  const isIncompleteStructure =
    /^(#{1,6})(?:\s|$)/.test(lastLine) ||
    /^\s*>\s?/.test(lastLine) ||
    /^\s*([-+*]|\d+[.)])\s/.test(lastLine) ||
    /^\s*[-+*]\s?$/.test(lastLine) ||
    /^\s*\d+[.)]\s?$/.test(lastLine) ||
    isIncompleteGfmTableLine(lastLine);

  let stable = source;
  if (isIncompleteStructure) {
    if (lastNewline === -1) stable = '';
    else stable = source.slice(0, lastNewline + 1);
  }

  return trimIncompleteBoldMarkup(trimIncompleteFontMarkup(stable));
}
