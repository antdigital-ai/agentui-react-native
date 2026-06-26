import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useState } from 'react';

const INITIAL_BATCH = 8;
const BATCH_SIZE = 6;
const PROGRESSIVE_THRESHOLD = 12;

interface ProgressiveState {
  visibleCount: number;
  lastTotal: number;
  lastStreaming: boolean;
  lastGeneration: number | undefined;
}

const computeResetVisibleCount = (
  totalBlocks: number,
  streaming: boolean,
): number => {
  if (streaming || totalBlocks <= PROGRESSIVE_THRESHOLD) return totalBlocks;
  return Math.min(INITIAL_BATCH, totalBlocks);
};

export function useProgressiveBlocks(
  totalBlocks: number,
  streaming: boolean,
  generation?: number,
): number {
  const [state, setState] = useState<ProgressiveState>(() => ({
    visibleCount: computeResetVisibleCount(totalBlocks, streaming),
    lastTotal: totalBlocks,
    lastStreaming: streaming,
    lastGeneration: generation,
  }));

  let visibleCount = state.visibleCount;
  const totalChanged = totalBlocks !== state.lastTotal;
  const streamingChanged = streaming !== state.lastStreaming;
  const generationChanged = generation !== state.lastGeneration;

  if (totalChanged || streamingChanged || generationChanged) {
    visibleCount = computeResetVisibleCount(totalBlocks, streaming);
    setState({
      visibleCount,
      lastTotal: totalBlocks,
      lastStreaming: streaming,
      lastGeneration: generation,
    });
  }

  useEffect(() => {
    if (streaming || state.visibleCount >= totalBlocks) return;

    const appState = AppState.currentState;
    if (appState !== 'active') {
      setState((prev) => ({ ...prev, visibleCount: totalBlocks }));
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;
      const bump = () => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          visibleCount: Math.min(prev.visibleCount + BATCH_SIZE, totalBlocks),
        }));
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(bump);
      } else {
        setTimeout(bump, 16);
      }
    };

    scheduleNext();

    const handleAppState = (next: AppStateStatus) => {
      if (next !== 'active') {
        cancelled = true;
        setState((prev) => ({ ...prev, visibleCount: totalBlocks }));
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [state.visibleCount, totalBlocks, streaming]);

  return visibleCount;
}
