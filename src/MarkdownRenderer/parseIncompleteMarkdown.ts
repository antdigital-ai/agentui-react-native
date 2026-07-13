import { remend, type RemendOptions } from './remarkBundle';

/** Defaults aligned with Streamdown's remend integration. */
export const DEFAULT_REMEND_OPTIONS: RemendOptions = {
  bold: true,
  boldItalic: true,
  italic: true,
  inlineCode: true,
  links: true,
  images: true,
  strikethrough: true,
  htmlTags: true,
  setextHeadings: true,
  comparisonOperators: true,
  singleTilde: true,
  inlineKatex: false,
  katex: true,
  /** RN: show link text only until URL completes — avoids placeholder protocols. */
  linkMode: 'text-only',
};

export type ParseIncompleteMarkdownOptions = RemendOptions & {
  /** When false, returns input unchanged (Streamdown `parseIncompleteMarkdown={false}`). */
  enabled?: boolean;
};

/**
 * Streamdown-style unterminated block parsing via remend.
 * Completes incomplete bold, links, code, etc. during streaming.
 */
export function parseIncompleteMarkdown(
  content: string,
  options: ParseIncompleteMarkdownOptions = {},
): string {
  if (!content) {
    return content;
  }
  const { enabled = true, ...remendOptions } = options;
  if (!enabled) {
    return content;
  }
  return remend(content, { ...DEFAULT_REMEND_OPTIONS, ...remendOptions });
}
