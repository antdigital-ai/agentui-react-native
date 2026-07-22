import {
  DEFAULT_STREAM_BEZIER,
  easingMultiplier,
  sampleCubicBezier,
} from '../src/MarkdownRenderer/streaming/cubicBezier';
import { ContentThrottle } from '../src/MarkdownRenderer/ContentThrottle';

describe('sampleCubicBezier', () => {
  it('clamps endpoints', () => {
    expect(sampleCubicBezier(0)).toBe(0);
    expect(sampleCubicBezier(1)).toBe(1);
    expect(sampleCubicBezier(-0.5)).toBe(0);
    expect(sampleCubicBezier(1.5)).toBe(1);
  });

  it('returns identity for linear control points', () => {
    expect(sampleCubicBezier(0.35, [0, 0, 1, 1])).toBeCloseTo(0.35, 5);
  });

  it('samples ease-out above the diagonal mid-curve', () => {
    // ease-out: faster early progress → y > x for mid values
    const y = sampleCubicBezier(0.5, [0, 0, 0.58, 1]);
    expect(y).toBeGreaterThan(0.5);
    expect(y).toBeLessThan(1);
  });

  it('uses DEFAULT_STREAM_BEZIER when points omitted', () => {
    const y = sampleCubicBezier(0.4, DEFAULT_STREAM_BEZIER);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(1);
  });
});

describe('easingMultiplier', () => {
  it('maps empty backlog to min and full soft-cap to max', () => {
    expect(
      easingMultiplier(0, DEFAULT_STREAM_BEZIER, 1, 6),
    ).toBeCloseTo(1, 5);
    expect(
      easingMultiplier(1, DEFAULT_STREAM_BEZIER, 1, 6),
    ).toBeCloseTo(6, 5);
  });

  it('increases with backlog', () => {
    const low = easingMultiplier(0.2, DEFAULT_STREAM_BEZIER, 1, 6);
    const high = easingMultiplier(0.8, DEFAULT_STREAM_BEZIER, 1, 6);
    expect(high).toBeGreaterThan(low);
  });
});

describe('ContentThrottle easing', () => {
  it('catches up faster with large backlog than linear mode', () => {
    jest.useFakeTimers();
    const text = 'a'.repeat(200);

    const linearFrames: string[] = [];
    const linear = new ContentThrottle((s) => linearFrames.push(s), {
      charsPerFrame: 2,
      easing: false,
    });
    linear.syncImmediate('');
    linear.push(text);
    jest.runOnlyPendingTimers();
    const linearGain = linearFrames[linearFrames.length - 1]?.length ?? 0;
    linear.dispose();

    const easedFrames: string[] = [];
    const eased = new ContentThrottle((s) => easedFrames.push(s), {
      charsPerFrame: 2,
      easing: {
        backlogSoftCap: 64,
        minMultiplier: 1,
        maxMultiplier: 8,
      },
    });
    eased.syncImmediate('');
    eased.push(text);
    jest.runOnlyPendingTimers();
    const easedGain = easedFrames[easedFrames.length - 1]?.length ?? 0;
    eased.dispose();

    jest.useRealTimers();
    expect(easedGain).toBeGreaterThan(linearGain);
  });

  it('still reaches full text with easing enabled', () => {
    jest.useFakeTimers();
    const text = 'hello world streaming ease';
    const frames: string[] = [];
    const engine = new ContentThrottle((s) => frames.push(s), {
      charsPerFrame: 2,
      easing: true,
    });
    engine.syncImmediate('');
    engine.push(text);
    for (let i = 0; i < 100; i++) {
      jest.runOnlyPendingTimers();
    }
    engine.dispose();
    jest.useRealTimers();
    expect(frames[frames.length - 1]).toBe(text);
  });
});
