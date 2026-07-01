import { createHastProcessor } from '../src/MarkdownRenderer/processor';

function runMarkdown(markdown: string) {
  const processor = createHastProcessor();
  const mdast = processor.parse(markdown);
  return processor.runSync(mdast) as unknown as {
    children: Array<{ type: string; tagName?: string; value?: string; children?: unknown[] }>;
  };
}

describe('rehypeFontFromRaw', () => {
  it('converts inline br tags in text nodes to newlines', () => {
    const tree = runMarkdown('Line1<br>Line2');
    const paragraph = tree.children[0];
    expect(JSON.stringify(paragraph.children)).toContain('Line1\\nLine2');
  });

  it('flattens unsupported custom tags in text nodes', () => {
    const tree = runMarkdown('x<custom>y</custom>z');
    const paragraph = tree.children[0];
    expect(JSON.stringify(paragraph.children)).toContain('xyz');
  });

  it('flattens unsupported block elements to text', () => {
    const tree = runMarkdown('<figcaption>Hidden</figcaption>');
    expect(JSON.stringify(tree.children)).toContain('Hidden');
    expect(JSON.stringify(tree.children)).not.toContain('figcaption');
  });
});
