import { Platform, useWindowDimensions } from 'react-native';
import {
  isCompactLayout,
  MOBILE_LAYOUT_BREAKPOINT,
  type LayoutDensity,
} from './layout';

export function useCompactLayout(
  density: LayoutDensity = 'auto',
  breakpoint = MOBILE_LAYOUT_BREAKPOINT,
): boolean {
  const { width } = useWindowDimensions();
  if (density !== 'auto') {
    return isCompactLayout(width, density);
  }
  return Platform.OS !== 'web' || width < breakpoint;
}
