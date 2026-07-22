import { AppState, type AppStateStatus } from 'react-native';
import type {
  ContentThrottleEasing,
  ContentThrottleOptions,
} from './types';
import {
  DEFAULT_STREAM_BEZIER,
  easingMultiplier,
  type CubicBezierPoints,
} from './streaming/cubicBezier';

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_SPEED = 1;
const DEFAULT_BACKGROUND_INTERVAL_MS = 100;
const DEFAULT_BACKGROUND_BATCH_MULTIPLIER = 10;
const DEFAULT_BACKLOG_SOFT_CAP = 96;
const DEFAULT_MIN_MULTIPLIER = 1;
const DEFAULT_MAX_MULTIPLIER = 6;

interface ResolvedEasing {
  enabled: boolean;
  backlogSoftCap: number;
  bezier: CubicBezierPoints;
  minMultiplier: number;
  maxMultiplier: number;
}

interface ResolvedOptions {
  charsPerFrame: number;
  speed: number;
  flushOnComplete: boolean;
  backgroundInterval: number;
  backgroundBatchMultiplier: number;
  easing: ResolvedEasing;
}

function resolveEasing(
  easing: ContentThrottleOptions['easing'],
): ResolvedEasing {
  if (easing === false) {
    return {
      enabled: false,
      backlogSoftCap: DEFAULT_BACKLOG_SOFT_CAP,
      bezier: DEFAULT_STREAM_BEZIER,
      minMultiplier: DEFAULT_MIN_MULTIPLIER,
      maxMultiplier: DEFAULT_MAX_MULTIPLIER,
    };
  }
  const cfg: ContentThrottleEasing =
    easing === true || easing == null ? {} : easing;
  return {
    enabled: true,
    backlogSoftCap: Math.max(1, cfg.backlogSoftCap ?? DEFAULT_BACKLOG_SOFT_CAP),
    bezier: cfg.bezier ?? DEFAULT_STREAM_BEZIER,
    minMultiplier: Math.max(0.1, cfg.minMultiplier ?? DEFAULT_MIN_MULTIPLIER),
    maxMultiplier: Math.max(
      cfg.minMultiplier ?? DEFAULT_MIN_MULTIPLIER,
      cfg.maxMultiplier ?? DEFAULT_MAX_MULTIPLIER,
    ),
  };
}

export class ContentThrottle {
  private displayedLength = 0;
  private fullContent = '';
  private rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private readonly onFlush: (displayed: string) => void;
  private options: ResolvedOptions;
  private disposed = false;
  private appStateSubscription: { remove: () => void } | null = null;
  private appStateVisible = true;

  constructor(
    onFlush: (displayed: string) => void,
    options?: ContentThrottleOptions,
  ) {
    this.onFlush = onFlush;
    this.options = ContentThrottle.resolveOptions(options);
    this.appStateVisible = AppState.currentState === 'active';
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  }

  private static resolveOptions(
    options?: ContentThrottleOptions,
  ): ResolvedOptions {
    return {
      charsPerFrame: options?.charsPerFrame ?? DEFAULT_CHARS_PER_FRAME,
      speed: options?.speed ?? DEFAULT_SPEED,
      flushOnComplete: options?.flushOnComplete ?? true,
      backgroundInterval:
        options?.backgroundInterval ?? DEFAULT_BACKGROUND_INTERVAL_MS,
      backgroundBatchMultiplier:
        options?.backgroundBatchMultiplier ??
        DEFAULT_BACKGROUND_BATCH_MULTIPLIER,
      easing: resolveEasing(options?.easing),
    };
  }

  setOptions(options?: ContentThrottleOptions): void {
    this.options = ContentThrottle.resolveOptions(options);
    if (this.displayedLength < this.fullContent.length) {
      this.ensureTicking();
    }
  }

  /** Show full content immediately without animation (first paint / remount). */
  syncImmediate(content: string): void {
    this.cancelAllTicks();
    this.fullContent = content;
    this.displayedLength = content.length;
    this.onFlush(content);
  }

  push(content: string): void {
    if (content === this.fullContent) {
      if (this.displayedLength < content.length) this.ensureTicking();
      return;
    }
    const stillPrefix =
      content.length >= this.displayedLength &&
      (this.displayedLength === 0 ||
        content.charCodeAt(this.displayedLength - 1) ===
          this.fullContent.charCodeAt(this.displayedLength - 1));
    if (!stillPrefix) {
      this.displayedLength = 0;
    }
    this.fullContent = content;
    if (this.displayedLength >= content.length) {
      this.onFlush(content);
      return;
    }
    this.ensureTicking();
  }

  complete(): void {
    if (!this.options.flushOnComplete) return;
    if (this.displayedLength >= this.fullContent.length) return;
    this.cancelAllTicks();
    this.displayedLength = this.fullContent.length;
    this.onFlush(this.fullContent);
  }

  dispose(): void {
    this.disposed = true;
    this.cancelAllTicks();
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  private handleAppStateChange(next: AppStateStatus): void {
    this.appStateVisible = next === 'active';
    if (this.disposed) return;
    if (this.displayedLength >= this.fullContent.length) return;
    this.cancelAllTicks();
    this.ensureTicking();
  }

  private ensureTicking(): void {
    if (this.disposed || this.rafId !== null || this.timerId !== null) return;
    this.schedule(this.appStateVisible);
  }

  private schedule(isVisible: boolean): void {
    if (isVisible && typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.timerId = setTimeout(this.tick, this.options.backgroundInterval);
    }
  }

  private resolveBatchSize(remaining: number, isVisible: boolean): number {
    const baseBatch = Math.max(
      1,
      Math.ceil(this.options.charsPerFrame * this.options.speed),
    );
    const { easing } = this.options;
    let batch = baseBatch;
    if (easing.enabled) {
      const ratio = remaining / easing.backlogSoftCap;
      const mult = easingMultiplier(
        ratio,
        easing.bezier,
        easing.minMultiplier,
        easing.maxMultiplier,
      );
      batch = Math.max(1, Math.ceil(baseBatch * mult));
    }
    if (!isVisible) {
      batch *= this.options.backgroundBatchMultiplier;
    }
    return batch;
  }

  private tick = (): void => {
    this.rafId = null;
    this.timerId = null;
    if (this.disposed) return;

    const remaining = this.fullContent.length - this.displayedLength;
    if (remaining <= 0) return;

    const isVisible = this.appStateVisible;
    const batchSize = this.resolveBatchSize(remaining, isVisible);

    this.displayedLength = Math.min(
      this.displayedLength + batchSize,
      this.fullContent.length,
    );
    this.onFlush(this.fullContent.slice(0, this.displayedLength));

    if (this.displayedLength < this.fullContent.length) {
      this.schedule(isVisible);
    }
  };

  private cancelAllTicks(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
