import React, { memo } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { webClassName } from '../theme/webClassName';
import { chevronDownSource, thinkGlyphSource } from './assets';

type ThinkGlyphProps = {
  size?: number;
};

/** Figma `988:18867` — sparkle asset only (no extra circle chrome). */
export const ThinkGlyph = memo(function ThinkGlyph({ size = 32 }: ThinkGlyphProps) {
  return (
    <Image
      {...webClassName('agentui-deep-thinking-glyph')}
      testID="deep-thinking-glyph"
      source={thinkGlyphSource}
      style={{ width: size, height: size, flexShrink: 0 }}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
});

type ThinkChevronProps = {
  expanded: boolean;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** Figma `1146:42699` arrow — down when expanded, points right when collapsed. */
export const ThinkChevron = memo(function ThinkChevron({
  expanded,
  size = 16,
  style,
}: ThinkChevronProps) {
  return (
    <Image
      source={chevronDownSource}
      style={[
        {
          width: size,
          height: size,
          transform: [{ rotate: expanded ? '0deg' : '-90deg' }],
        },
        style,
      ]}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
});
