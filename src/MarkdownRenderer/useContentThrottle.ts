import { useLayoutEffect, useRef, useState } from 'react';
import { ContentThrottle } from './ContentThrottle';
import type { ContentThrottleOptions } from './types';

export function useContentThrottle(
  content: string,
  enabled: boolean,
  options?: ContentThrottleOptions,
  isFinished?: boolean,
): string {
  const charsPerFrame = options?.charsPerFrame;
  const speed = options?.speed;
  const flushOnComplete = options?.flushOnComplete;
  const backgroundInterval = options?.backgroundInterval;
  const backgroundBatchMultiplier = options?.backgroundBatchMultiplier;
  const [displayed, setDisplayed] = useState(content);
  const engineRef = useRef<ContentThrottle | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useLayoutEffect(() => {
    if (!enabled) {
      engineRef.current?.dispose();
      engineRef.current = null;
      setDisplayed(content);
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new ContentThrottle(setDisplayed, optionsRef.current);
      engineRef.current.syncImmediate(content);
    } else {
      engineRef.current.setOptions(optionsRef.current);
      engineRef.current.push(content);
    }
    if (isFinished) engineRef.current.complete();
  }, [content, enabled, isFinished]);

  useLayoutEffect(() => {
    if (!enabled || !engineRef.current) return;
    engineRef.current.setOptions(optionsRef.current);
  }, [
    enabled,
    charsPerFrame,
    speed,
    flushOnComplete,
    backgroundInterval,
    backgroundBatchMultiplier,
  ]);

  useLayoutEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    [],
  );

  return enabled ? displayed : content;
}
