import { AppState, Platform, type AppStateStatus } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const INITIAL_BATCH = 8;
const BATCH_SIZE = 6;
const PROGRESSIVE_THRESHOLD = 12;

const computeResetVisibleCount = (
  totalBlocks: number,
  streaming: boolean,
): number => {
  if (streaming || totalBlocks <= PROGRESSIVE_THRESHOLD) return totalBlocks;
  return Math.min(INITIAL_BATCH, totalBlocks);
};

/**
 * Reveal long static markdown in batches on iOS/Web.
 * Android FlatList + view collapsing breaks when blocks appear progressively,
 * so render all blocks immediately there.
 */
export function useProgressiveBlocks(
  totalBlocks: number,
  streaming = false,
  generation = 0,
): number {
  if (Platform.OS === 'android') {
    return totalBlocks;
  }

  const [visibleCount, setVisibleCount] = useState(() =>
    computeResetVisibleCount(totalBlocks, streaming),
  );
  const resetKeyRef = useRef(
    `${totalBlocks}:${streaming ? 1 : 0}:${generation}`,
  );

  useEffect(() => {
    const resetKey = `${totalBlocks}:${streaming ? 1 : 0}:${generation}`;
    if (resetKeyRef.current === resetKey) return;
    resetKeyRef.current = resetKey;
    setVisibleCount(computeResetVisibleCount(totalBlocks, streaming));
  }, [totalBlocks, streaming, generation]);

  useEffect(() => {
    if (streaming || visibleCount >= totalBlocks) return;

    const appState = AppState.currentState;
    if (appState === 'background' || appState === 'inactive') {
      setVisibleCount(totalBlocks);
      return;
    }

    let cancelled = false;

    const bump = () => {
      if (cancelled) return;
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, totalBlocks));
    };

    const handle =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(bump)
        : (setTimeout(bump, 16) as unknown as number);

    const handleAppState = (next: AppStateStatus) => {
      if (next !== 'active') {
        cancelled = true;
        setVisibleCount(totalBlocks);
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      cancelled = true;
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(handle);
      } else {
        clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
      }
      sub.remove();
    };
  }, [visibleCount, totalBlocks, streaming]);

  return visibleCount;
}
