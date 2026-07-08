import { splitMarkdownBlocks } from '../src/MarkdownRenderer/streaming/splitMarkdownBlocks';
import { getStreamingStableMarkdownBlock } from '../src/MarkdownRenderer/streaming/stableTailMarkdown';

describe('portfolio review streaming tail', () => {
  it('holds blockquote line without newline while actively streaming', () => {
    const block = '> 以上为信息与分析，投资决策请你自行判断。';
    expect(getStreamingStableMarkdownBlock(block)).toBe('');
  });

  it('holds heading line without newline while actively streaming', () => {
    expect(getStreamingStableMarkdownBlock('## What this means')).toBe('');
  });

  it('splits portfolio tail into expected blocks', () => {
    const content = `Data note: 测试网资产（Pharos_Testnet）已排除。

## What this means

- **集中度（HHI 0.375）**：说明。

> 以上为信息与分析，投资决策请你自行判断。`;
    const blocks = splitMarkdownBlocks(content);
    expect(blocks.some((b) => b.includes('What this means'))).toBe(true);
    expect(blocks.some((b) => b.includes('以上为信息'))).toBe(true);
  });
});
