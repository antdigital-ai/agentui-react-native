import { splitMarkdownBlocks } from '../src/MarkdownRenderer/streaming/splitMarkdownBlocks';
import { shouldReparseLastBlock } from '../src/MarkdownRenderer/streaming/lastBlockThrottle';
import { getStreamingStableMarkdownBlock } from '../src/MarkdownRenderer/streaming/stableTailMarkdown';

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

  it('keeps ATX heading and following list in one block', () => {
    const md = '##### Bull Case\n\n- one\n- two';
    const blocks = splitMarkdownBlocks(md);
    expect(blocks).toEqual(['##### Bull Case\n\n- one\n- two']);
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

  it('holds incomplete ATX heading line until newline', () => {
    expect(getStreamingStableMarkdownBlock('#### Bull')).toBe('');
    expect(getStreamingStableMarkdownBlock('Intro\n\n#### Bull')).toBe('Intro\n\n');
    expect(getStreamingStableMarkdownBlock('#### Bull Case\n')).toBe(
      '#### Bull Case\n',
    );
  });

  it('holds incomplete list line until newline', () => {
    expect(getStreamingStableMarkdownBlock('- Expanding spot')).toBe('');
    expect(getStreamingStableMarkdownBlock('Text\n\n- item')).toBe('Text\n\n');
    expect(getStreamingStableMarkdownBlock('- item done\n')).toBe('- item done\n');
  });

  it('does not reparse while ATX line is still growing', () => {
    const prev = 'Intro\n\n';
    const next = 'Intro\n\n### Bull';
    expect(getStreamingStableMarkdownBlock(next)).toBe(prev);
    expect(shouldReparseLastBlock(prev, getStreamingStableMarkdownBlock(next), true)).toBe(
      false,
    );
  });

  it('holds incomplete font tag until closing tag is complete', () => {
    const prefix = '**72,732.45** · ';
    expect(getStreamingStableMarkdownBlock(prefix + '<font')).toBe(prefix);
    expect(getStreamingStableMarkdownBlock(prefix + '<font color="#FF5B5B">')).toBe(
      prefix,
    );
    expect(
      getStreamingStableMarkdownBlock(prefix + '<font color="#FF5B5B">-2.63%'),
    ).toBe(prefix);
    expect(
      getStreamingStableMarkdownBlock(
        prefix + '<font color="#FF5B5B">-2.63%</font>',
      ),
    ).toBe(prefix + '<font color="#FF5B5B">-2.63%</font>');
    expect(
      getStreamingStableMarkdownBlock(
        prefix + '<font color="#FF5B5B">-2.63%</font>\n',
      ),
    ).toBe(prefix + '<font color="#FF5B5B">-2.63%</font>\n');
  });

  it('holds incomplete GFM table row until newline', () => {
    expect(getStreamingStableMarkdownBlock('| header | value')).toBe('');
    expect(getStreamingStableMarkdownBlock('| header | value |')).toBe('');
    expect(getStreamingStableMarkdownBlock('Intro\n\n| h')).toBe('Intro\n\n');
    expect(getStreamingStableMarkdownBlock('| header | value |\n')).toBe(
      '| header | value |\n',
    );
    const partialTable =
      '| header | value |\n| --- | --- |\n| 24H Volume | $456';
    expect(getStreamingStableMarkdownBlock(partialTable)).toBe(
      '| header | value |\n| --- | --- |\n',
    );
  });

  it('holds incomplete ** bold until closing delimiter', () => {
    expect(getStreamingStableMarkdownBlock('**BTC-PERP')).toBe('');
    expect(getStreamingStableMarkdownBlock('**BTC-PERP*')).toBe('');
    expect(getStreamingStableMarkdownBlock('**BTC-PERP**')).toBe('**BTC-PERP**');
    expect(getStreamingStableMarkdownBlock('Line **bold')).toBe('Line ');
    expect(getStreamingStableMarkdownBlock('**done**\n**open')).toBe('**done**\n');
  });
});
