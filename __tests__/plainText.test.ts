import { isPlainMarkdownText } from '../src/MarkdownRenderer/plainText';

describe('isPlainMarkdownText', () => {
  it('returns true for plain English with em dash', () => {
    expect(
      isPlainMarkdownText(
        'This is a portfolio/position analysis request — routing to the Position Analysis specialist.',
      ),
    ).toBe(true);
  });

  it('returns true for mixed Chinese and English', () => {
    expect(isPlainMarkdownText('你好 world，这是一段普通回复。')).toBe(true);
  });

  it('returns false for multi-paragraph plain text', () => {
    expect(isPlainMarkdownText('Hello\n\nWorld')).toBe(false);
  });

  it('returns false for markdown syntax', () => {
    expect(isPlainMarkdownText('**bold** text')).toBe(false);
    expect(isPlainMarkdownText('| a | b |\n| --- | --- |')).toBe(false);
    expect(isPlainMarkdownText('```agent-card\n{}\n```')).toBe(false);
    expect(isPlainMarkdownText('- list item')).toBe(false);
    expect(isPlainMarkdownText('[link](https://example.com)')).toBe(false);
  });
});
