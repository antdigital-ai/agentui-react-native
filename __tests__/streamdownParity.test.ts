import { parseIncompleteMarkdown } from '../src/MarkdownRenderer/parseIncompleteMarkdown';
import { preprocessMaiInlineSyntax } from '../src/MarkdownRenderer/preprocessMaiInlineSyntax';
import { normalizeThinkingMarkdown } from '../src/MarkdownRenderer/normalizeChatMarkdown';

describe('parseIncompleteMarkdown (remend / Streamdown)', () => {
  it('completes unclosed bold markers', () => {
    expect(parseIncompleteMarkdown('Line **bold')).toBe('Line **bold**');
  });

  it('completes unclosed inline code', () => {
    expect(parseIncompleteMarkdown('Use `npm install')).toContain('`npm install`');
  });

  it('can be disabled like Streamdown parseIncompleteMarkdown={false}', () => {
    expect(parseIncompleteMarkdown('Line **bold', { enabled: false })).toBe('Line **bold');
  });
});

describe('preprocessMaiInlineSyntax', () => {
  it('converts ==mark==, ^sup^, and ~sub~ outside code fences', () => {
    const input = '==highlight== and ^sup^ and ~sub~';
    expect(preprocessMaiInlineSyntax(input)).toBe(
      '<mark>highlight</mark> and <sup>sup</sup> and <sub>sub</sub>',
    );
  });

  it('preserves ~~strikethrough~~', () => {
    expect(preprocessMaiInlineSyntax('~~strike~~')).toBe('~~strike~~');
  });

  it('does not mutate syntax inside fenced code blocks', () => {
    const input = ['```ts', '==raw==', '```'].join('\n');
    expect(preprocessMaiInlineSyntax(input)).toBe(input);
  });
});

describe('normalizeThinkingMarkdown', () => {
  it('renders repeated keepalive progress lines as markdown hard breaks', () => {
    const input = [
      '仍在处理中，已处理 28s（当前阶段：工具执行，阶段耗时 2s）。',
      '仍在处理中，已处理 38s（当前阶段：工具执行，阶段耗时 12s）。',
    ].join('\n');
    expect(normalizeThinkingMarkdown(input)).toBe(
      '仍在处理中，已处理 28s（当前阶段：工具执行，阶段耗时 2s）。  \n仍在处理中，已处理 38s（当前阶段：工具执行，阶段耗时 12s）。  \n',
    );
  });

  it('repairs pass-count fractions in thinking output', () => {
    expect(normalizeThinkingMarkdown('验证：1 2/13 通过，1个失败')).toBe(
      '验证：12/13 通过，1个失败',
    );
  });
});
