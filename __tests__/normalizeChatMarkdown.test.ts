import {
  normalizeChatMarkdown,
  normalizeStreamingMarkdownLight,
} from '../src/MarkdownRenderer/normalizeChatMarkdown';

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

  it('preserves table with `#` ordinal column header', () => {
    const input = [
      '## 六、关键待确认项（四方需在评审定稿）',
      '',
      '| # | 问题 | 各方倾向 |',
      '|---|------|---------|',
      '| 1 | 锁定期内输入**正确密码**是否放行 | 测试/安全：锁定优先拒绝 |',
    ].join('\n');
    const normalized = normalizeChatMarkdown(input);
    expect(normalized).toContain('| # | 问题 | 各方倾向 |');
  });

  it('preserves table with `#` ordinal column header while streaming', () => {
    const input = [
      '| # | 问题 | 各方倾向 |',
      '|---|------|---------|',
      '| 1 | 锁定期内',
    ].join('\n');
    expect(normalizeChatMarkdown(input, { streaming: true })).toContain(
      '| # | 问题 | 各方倾向 |',
    );
  });

  it('preserves partially streamed table header cell containing `#`', () => {
    const streamingChunk = '审定稿）\n\n| # | 问题 | 各';
    expect(normalizeChatMarkdown(streamingChunk, { streaming: true })).toContain(
      '| # | 问题 | 各',
    );
  });

  it('repairs table cell bold marker closed in a later cell', () => {
    const input = [
      '| 角色 | 核心目标 |',
      '|---|---|',
      '| **安全 | 防暴力破解、防撞库/凭证填充、防分布式暴力破解；保证锁定机制本身不被武器化**；全链路可审计、可告警。 |',
    ].join('\n');
    const normalized = normalizeChatMarkdown(input);
    expect(normalized).toContain(
      '| <strong>安全</strong> | 防暴力破解、防撞库/凭证填充、防分布式暴力破解；保证锁定机制本身不被武器化；全链路可审计、可告警。 |',
    );
    expect(normalized).not.toContain('武器化**');
    expect(normalized).not.toContain('| **安全 |');
  });

  it('separates heading glued to table header row', () => {
    const input =
      '###验证结果| 检查项 |结果 |\n|---|---|\n| 删除 3 个 Controller | ✅ |';
    const normalized = normalizeChatMarkdown(input);
    expect(normalized).toContain('### 验证结果\n\n| 检查项 |结果 |');
  });

  it('inserts missing hash spacing for mid-line headings', () => {
    expect(normalizeChatMarkdown('分层如下：##客户端入口层')).toBe(
      '分层如下：\n\n## 客户端入口层',
    );
    expect(normalizeChatMarkdown('###4 技术栈偏好')).toBe('### 4 技术栈偏好');
  });

  it('pre-converts special-char bold spans to HTML strong', () => {
    expect(normalizeChatMarkdown('达到**57%**增长')).toContain(
      '<strong>57%</strong>',
    );
    expect(normalizeChatMarkdown('Revenue is **$9.698M** this quarter.')).toContain(
      '<strong>$9.698M</strong>',
    );
  });

  it('keeps list repairs while streaming', () => {
    expect(normalizeChatMarkdown('-A. Web 前端应用', { streaming: true })).toBe(
      '- A. Web 前端应用',
    );
  });

  it('does not strip complete inline bold while streaming', () => {
    expect(normalizeStreamingMarkdownLight('Line **bold**')).toBe('Line **bold**');
    expect(normalizeStreamingMarkdownLight('Line **bold')).toBe('Line **bold');
  });

  it('streaming light path matches streaming normalize output', () => {
    const samples = [
      'intro\n```tsx\ncode',
      '-A. Web 前端应用',
      'intro paragraph\n| a | b |\n|---|---|\n| 1 | 2 |',
      '|方法 |路径 |说明 ||------|------|------|',
      '分层如下：## 客户端入口层',
    ];
    for (const sample of samples) {
      expect(normalizeStreamingMarkdownLight(sample)).toBe(
        normalizeChatMarkdown(sample, { streaming: true }),
      );
    }
  });
});
