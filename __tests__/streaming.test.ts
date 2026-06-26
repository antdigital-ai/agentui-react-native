import { splitMarkdownBlocks } from '../src/MarkdownRenderer/streaming/splitMarkdownBlocks';
import { shouldReparseLastBlock } from '../src/MarkdownRenderer/streaming/lastBlockThrottle';

describe('splitMarkdownBlocks', () => {
  it('splits on blank lines', () => {
    const blocks = splitMarkdownBlocks('Hello\n\nWorld');
    expect(blocks).toEqual(['Hello', 'World']);
  });

  it('keeps fenced code together across blank lines', () => {
    const md = '```js\nline1\n\nline2\n```\n\nAfter';
    const blocks = splitMarkdownBlocks(md);
    expect(blocks.length).toBe(2);
    expect(blocks[0]).toContain('line1');
    expect(blocks[0]).toContain('line2');
    expect(blocks[1]).toBe('After');
  });
});

describe('shouldReparseLastBlock', () => {
  it('reparse when inside unclosed fence', () => {
    const prev = '```\ncode';
    const next = '```\ncode more';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('throttles small alphanumeric additions', () => {
    const prev = 'Hello';
    const next = 'Hello wo';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('reparse on boundary characters', () => {
    const prev = 'Hello';
    const next = 'Hello\n';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });
});
