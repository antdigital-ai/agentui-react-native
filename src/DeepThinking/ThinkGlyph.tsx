import React, { memo } from 'react';
import { Image, View } from 'react-native';
import { chevronDownSource, thinkGlyphSource } from './assets';

type ThinkGlyphProps = {
  size?: number;
};

/** Figma `1182:19755` — AI sparkle in 32px circle (PNG @2x from SVG export). */
export const ThinkGlyph = memo(function ThinkGlyph({ size = 32 }: ThinkGlyphProps) {
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      testID="deep-thinking-glyph"
    >
      <Image
        source={thinkGlyphSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </View>
  );
});

type ThinkChevronProps = {
  expanded: boolean;
  size?: number;
};

/** Figma `1146:42699` arrow — down when expanded, points right when collapsed. */
export const ThinkChevron = memo(function ThinkChevron({
  expanded,
  size = 16,
}: ThinkChevronProps) {
  return (
    <Image
      source={chevronDownSource}
      style={{
        width: size,
        height: size,
        transform: [{ rotate: expanded ? '0deg' : '-90deg' }],
      }}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
});
