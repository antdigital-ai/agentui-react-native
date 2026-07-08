import { normalizeChatMarkdown } from '../src/MarkdownRenderer/normalizeChatMarkdown';

describe('normalizeChatMarkdown', () => {
  it('inserts blank line before opening fence glued to heading text', () => {
    const input = '### 二、核心架构模式：三级编排```\n客户端请求\n```';
    expect(normalizeChatMarkdown(input)).toMatch(/三级编排\n\n```/);
  });

  it('inserts blank lines before and after fenced code blocks', () => {
    expect(normalizeChatMarkdown('intro\n```tsx\ncode\n```\noutro')).toBe(
      'intro\n\n```tsx\ncode\n```\n\noutro',
    );
    expect(normalizeChatMarkdown('```ts\nconst x = 1;\n```')).toBe(
      '```ts\nconst x = 1;\n```',
    );
  });

  it('inserts blank line after closed fence before heading', () => {
    const input = '```tsx\ncode\n```\n### heading\n\nbody';
    expect(normalizeChatMarkdown(input)).toBe(
      '```tsx\ncode\n```\n\n### heading\n\nbody',
    );
  });

  it('separates closing fence from following heading on the same line', () => {
    const input = ['```tsx', 'const x = 1;', '```### 设计要点'].join('\n');
    expect(normalizeChatMarkdown(input)).toMatch(/```\n\n### 设计要点/);
  });

  it('converts spurious ``` --- fence lines into horizontal rules', () => {
    const input = 'intro\n``` ---\n### 数据模型详情';
    expect(normalizeChatMarkdown(input)).toBe(
      'intro\n---\n\n### 数据模型详情',
    );
  });

  it('inserts blank line before table following paragraph', () => {
    const input = 'intro paragraph\n| a | b |\n|---|---|\n| 1 | 2 |';
    expect(normalizeChatMarkdown(input)).toBe(
      'intro paragraph\n\n| a | b |\n|---|---|\n| 1 | 2 |',
    );
  });

  it('splits multiple table rows glued on one line', () => {
    const input = '|方法 |路径 |说明 ||------|------|------|';
    expect(normalizeChatMarkdown(input)).toBe(
      '|方法 |路径 |说明 |\n|------|------|------|',
    );
  });

  it('separates heading glued to preceding prose on the same line', () => {
    expect(normalizeChatMarkdown('分层如下：## 客户端入口层')).toBe(
      '分层如下：\n\n## 客户端入口层',
    );
  });

  it('inserts missing hash spacing for headings', () => {
    expect(normalizeChatMarkdown('##2. LEGAL.md')).toBe('## 2. LEGAL.md');
    expect(normalizeChatMarkdown('###典型使用流程')).toBe('### 典型使用流程');
  });

  it('closes unclosed fenced code blocks when streaming completes', () => {
    const input = 'example\n```python\nprint("hi")';
    expect(normalizeChatMarkdown(input, { streaming: false })).toBe(
      'example\n\n```python\nprint("hi")\n```',
    );
  });

  it('keeps fence blank-line spacing while streaming', () => {
    expect(normalizeChatMarkdown('intro\n```tsx\ncode', { streaming: true })).toBe(
      'intro\n\n```tsx\ncode',
    );
  });

  it('does not mutate list-like lines inside fenced code blocks', () => {
    const input = ['```ts', '-A. keep raw', '-**keep raw**', '```'].join('\n');
    expect(normalizeChatMarkdown(input)).toBe(input);
  });

  it('repairs unordered list marker spacing', () => {
    expect(normalizeChatMarkdown('-A. Web 前端应用')).toBe('- A. Web 前端应用');
  });
});
