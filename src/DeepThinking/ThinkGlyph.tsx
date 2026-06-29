import React, { memo } from 'react';
import { Image, View } from 'react-native';
import { webClassName } from '../theme/webClassName';
import { defaultDeepThinkingTheme } from './deepThinkingTheme';
import { chevronDownSource, thinkGlyphSource } from './assets';

type ThinkGlyphProps = {
  size?: number;
};

/** Figma `988:18867` sparkle inside `1182:19755` 32px circle. */
export const ThinkGlyph = memo(function ThinkGlyph({ size = 32 }: ThinkGlyphProps) {
  const { icon } = defaultDeepThinkingTheme;
  const glyphSize = Math.round(size * (14 / 32));

  return (
    <View
      {...webClassName('agentui-deep-thinking-glyph')}
      style={[
        icon,
        {
          width: size,
          height: size,
          flexShrink: 0,
        },
      ]}
      testID="deep-thinking-glyph"
    >
      <Image
        source={thinkGlyphSource}
        style={{ width: glyphSize, height: glyphSize }}
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
