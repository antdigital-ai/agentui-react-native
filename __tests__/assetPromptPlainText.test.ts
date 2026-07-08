import { isPlainMarkdownText } from '../src/MarkdownRenderer/plainText';
import { normalizeChatMarkdown } from '../src/MarkdownRenderer/normalizeChatMarkdown';
import { ContentThrottle } from '../src/MarkdownRenderer/ContentThrottle';

const ASSET_PROMPT =
  '请告诉我你要分析的资产名称、代号或合约地址（例如 BTC、ETH，或某个代币的 symbol / 合约地址），我会帮你做资产分析。';

describe('asset prompt plain text', () => {
  it('is treated as plain markdown text', () => {
    expect(isPlainMarkdownText(ASSET_PROMPT)).toBe(true);
  });

  it('is not altered by normalizeChatMarkdown', () => {
    expect(normalizeChatMarkdown(ASSET_PROMPT, { streaming: true })).toBe(
      ASSET_PROMPT,
    );
    expect(normalizeChatMarkdown(ASSET_PROMPT)).toBe(ASSET_PROMPT);
  });

  it('ContentThrottle eventually shows full text without isFinished', () => {
    jest.useFakeTimers();
    const frames: string[] = [];
    const engine = new ContentThrottle((s) => frames.push(s), {
      charsPerFrame: 3,
      enabled: true,
    });
    engine.syncImmediate('');
    engine.push(ASSET_PROMPT);

    for (let i = 0; i < 200; i++) {
      jest.runOnlyPendingTimers();
    }
    engine.dispose();
    jest.useRealTimers();

    expect(frames[frames.length - 1]).toBe(ASSET_PROMPT);
  });

  it('ContentThrottle flushes immediately on complete()', () => {
    const frames: string[] = [];
    const engine = new ContentThrottle((s) => frames.push(s), {
      charsPerFrame: 3,
    });
    engine.syncImmediate('');
    engine.push(ASSET_PROMPT);
    engine.complete();
    engine.dispose();
    expect(frames[frames.length - 1]).toBe(ASSET_PROMPT);
  });
});
