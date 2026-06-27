import { Platform } from 'react-native';

/** Matches agentic-ui `MOBILE_BREAKPOINT` (768px). */
export const MOBILE_LAYOUT_BREAKPOINT = 768;

export type LayoutDensity = 'auto' | 'compact' | 'comfortable';

export function isCompactLayout(
  windowWidth: number,
  density: LayoutDensity = 'auto',
): boolean {
  if (density === 'compact') return true;
  if (density === 'comfortable') return false;
  return Platform.OS !== 'web' || windowWidth < MOBILE_LAYOUT_BREAKPOINT;
}
