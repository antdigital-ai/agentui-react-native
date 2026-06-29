import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { webClassName } from '../theme/webClassName';
import {
  defaultDeepThinkingLabels,
  deepThinkingBodyMarkdownTheme,
  mergeDeepThinkingTheme,
} from './deepThinkingTheme';
import { ThinkChevron, ThinkGlyph } from './ThinkGlyph';
import type { DeepThinkingProps } from './types';

function resolveLabel(
  status: DeepThinkingProps['status'],
  label: string | undefined,
  labels: DeepThinkingProps['labels'],
): string {
  if (label != null && label !== '') return label;
  const merged = { ...defaultDeepThinkingLabels, ...labels };
  if (status === 'thinking') return merged.thinking;
  if (status === 'failed') return merged.failed;
  return merged.completed;
}

export const DeepThinking = memo(function DeepThinking({
  status,
  label,
  body,
  expandable: expandableProp,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  labels,
  layoutDensity = 'auto',
  theme: themePartial,
  style,
  testID = 'deep-thinking',
  icon,
  accessibilityLabel,
  showExpandChevron = false,
}: DeepThinkingProps) {
  const theme = useMemo(
    () => mergeDeepThinkingTheme(themePartial),
    [themePartial],
  );
  const hasBody = Boolean(body?.trim());
  const expandable = expandableProp ?? hasBody;
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedInternal;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (expandedProp === undefined) setExpandedInternal(next);
      onExpandedChange?.(next);
    },
    [expandedProp, onExpandedChange],
  );

  const toggle = useCallback(() => {
    if (!expandable) return;
    setExpanded(!expanded);
  }, [expandable, expanded, setExpanded]);

  const title = resolveLabel(status, label, labels);
  const showChevron =
    showExpandChevron && expandable && hasBody;

  const labelTextStyle: StyleProp<TextStyle> = [
    theme.labelWrap,
    theme.label,
    Platform.OS === 'android' ? { includeFontPadding: false } : null,
    Platform.OS === 'web'
      ? ({ marginBlock: 0, paddingBlock: 0 } as TextStyle)
      : null,
  ];

  const headerRow = (
    <>
      {icon ?? <ThinkGlyph size={theme.iconSize} />}
      <Text
        style={labelTextStyle}
        numberOfLines={2}
        {...webClassName('agentui-deep-thinking-label')}
      >
        {title}
      </Text>
      {status === 'thinking' ? (
        <ActivityIndicator size="small" color={theme.label.color as string} />
      ) : null}
      {showChevron ? (
        <ThinkChevron expanded={expanded} style={theme.chevron} />
      ) : null}
    </>
  );

  const rowStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.iconSize,
    columnGap: theme.rowGap,
    gap: theme.rowGap,
  };

  return (
    <View
      testID={testID}
      {...webClassName('agentui-deep-thinking')}
      style={[{ marginBottom: theme.blockGap, gap: theme.bodyGap }, style]}
    >
      {expandable ? (
        <Pressable
          testID={`${testID}-header`}
          {...webClassName('agentui-deep-thinking-header')}
          onPress={toggle}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={accessibilityLabel ?? title}
          style={({ pressed }) => [rowStyle, pressed ? { opacity: 0.85 } : null]}
        >
          {headerRow}
        </Pressable>
      ) : (
        <View {...webClassName('agentui-deep-thinking-header')} style={rowStyle}>
          {headerRow}
        </View>
      )}
      {expanded && hasBody ? (
        <View
          style={theme.bodyContainer}
          {...webClassName('agentui-deep-thinking-body')}
        >
          <MarkdownRenderer
            content={body!}
            layoutDensity={layoutDensity}
            isFinished={status !== 'thinking'}
            theme={deepThinkingBodyMarkdownTheme}
            testID={`${testID}-body`}
          />
        </View>
      ) : null}
    </View>
  );
});
