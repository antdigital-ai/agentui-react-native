const MARKDOWN_SYNTAX_PATTERNS: RegExp[] = [
  /^#{1,6}\s/m,
  /\*\*|__/,
  /(^|\n)\s*[-+*]\s/,
  /(^|\n)\s*\d+[.)]\s/,
  /(^|\n)\s*>/,
  /```/,
  /`[^`\n]+`/,
  /\[[^\]]+\]\([^)]+\)/,
  /^\|.+\|$/m,
  /(^|\n)---+\s*($|\n)/,
  /<[a-z][^>]*>/i,
];

/** True when content has no markdown syntax and can render as a single RN Text node. */
export function isPlainMarkdownText(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;
  // Multi-paragraph plain text still needs block splitting for spacing.
  if (/\n\s*\n/.test(content)) return false;
  return !MARKDOWN_SYNTAX_PATTERNS.some((pattern) => pattern.test(content));
}
