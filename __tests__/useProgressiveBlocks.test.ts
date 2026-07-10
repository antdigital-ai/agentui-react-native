import { Platform } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { useProgressiveBlocks } from '../src/MarkdownRenderer/streaming/useProgressiveBlocks';

describe('useProgressiveBlocks', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  it('returns all blocks immediately on Android', () => {
    Platform.OS = 'android';
    const { result } = renderHook(() => useProgressiveBlocks(24, false, 0));
    expect(result.current).toBe(24);
  });

  it('reveals long static messages in batches on iOS', () => {
    Platform.OS = 'ios';
    let rafCb: (() => void) | null = null;
    const rafSpy = jest
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        rafCb = cb as () => void;
        return 1;
      });

    const { result } = renderHook(() => useProgressiveBlocks(24, false, 0));
    expect(result.current).toBe(8);

    act(() => {
      rafCb?.();
    });
    expect(result.current).toBe(14);

    rafSpy.mockRestore();
  });

  it('shows all blocks while streaming on iOS', () => {
    Platform.OS = 'ios';
    const { result } = renderHook(() => useProgressiveBlocks(24, true, 0));
    expect(result.current).toBe(24);
  });
});
