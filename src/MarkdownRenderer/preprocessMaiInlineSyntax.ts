const FENCE_LINE_PATTERN = /^(`{3,}|~{3,})(.*)$/;

interface FenceContext {
  inFenced: boolean;
}

function mapMarkdownLinesOutsideFences(
  text: string,
  mapLine: (line: string, ctx: FenceContext) => string,
): string {
  const lines = text.split('\n');
  let inFenced = false;
  let closingFence = '';

  return lines
    .map((line) => {
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
        } else if (
          char === closingFence[0] &&
          len >= closingFence.length &&
          /^\s*$/.test(after)
        ) {
          inFenced = false;
          closingFence = '';
        }
      }

      return mapped;
    })
    .join('\n');
}

function mapSegmentsOutsideInlineCode(
  line: string,
  mapSegment: (segment: string) => string,
): string {
  const parts = line.split(/(`[^`\n]+`)/g);
  return parts.map((part, index) => (index % 2 === 1 ? part : mapSegment(part))).join('');
}

/** MAI-style `==highlight==`, `^sup^`, single-tilde `~sub~` (not `~~strike~~`). */
function preprocessMaiInlineSyntaxSegment(text: string): string {
  let result = text;
  result = result.replace(/==([^=\n]+?)==/g, '<mark>$1</mark>');
  result = result.replace(/\^([^\^\n]+?)\^/g, '<sup>$1</sup>');
  result = result.replace(/~([^~\n]+?)~(?!~)/g, '<sub>$1</sub>');
  return result;
}

function preprocessMaiInlineSyntaxOnLine(line: string): string {
  return mapSegmentsOutsideInlineCode(line, preprocessMaiInlineSyntaxSegment);
}

/** VS Code Markdown All in One inline syntax extensions. */
export function preprocessMaiInlineSyntax(text: string): string {
  if (!text.includes('==') && !text.includes('^') && !text.includes('~')) {
    return text;
  }
  return mapMarkdownLinesOutsideFences(text, (line, ctx) => {
    if (ctx.inFenced || line.includes('`')) {
      return line;
    }
    return preprocessMaiInlineSyntaxOnLine(line);
  });
}
