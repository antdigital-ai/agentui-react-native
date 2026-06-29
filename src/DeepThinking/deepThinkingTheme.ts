import type { TextStyle, ViewStyle } from 'react-native';
import { agenticColors } from '../theme/agenticTokens';
import { figmaHomeSpacing } from '../theme/figmaHomeSpacing';
import { figmaHomeFontFamily } from '../theme/fonts';
import type { MarkdownThemeOverride } from '../theme/defaultTheme';

export interface DeepThinkingTheme {
  rowGap: number;
  blockGap: number;
  bodyGap: number;
  iconSize: number;
  icon: ViewStyle;
  iconInner: ViewStyle;
  label: TextStyle;
  labelWrap: ViewStyle;
  chevron: ViewStyle;
  bodyContainer: ViewStyle;
}

const figma = agenticColors.figmaHome;

/** Figma `1182:19754` think row — 32 icon, 8 gap; expanded body `675:23594` +4px under header */
export const defaultDeepThinkingTheme: DeepThinkingTheme = {
  rowGap: 8,
  blockGap: figmaHomeSpacing.messageGap,
  bodyGap: 4,
  iconSize: 32,
  icon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#fcfdfd',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5b7cff',
    opacity: 0.95,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: figma.text,
    letterSpacing: 0,
    ...figmaHomeFontFamily,
  },
  labelWrap: {
    flex: 1,
    minHeight: 32,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  chevron: {
    width: 16,
    height: 16,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  bodyContainer: {
    paddingLeft: 40,
    paddingTop: 0,
  },
};

/** Figma think body `675:23594` — 段落/sm, 浅色注释, lh 1.8 */
export const deepThinkingBodyMarkdownTheme: MarkdownThemeOverride = {
  colors: {
    text: figma.textCaption,
  },
  typography: {
    body: {
      fontSize: 12,
      lineHeight: 22,
      fontWeight: '500',
      letterSpacing: 0,
      ...figmaHomeFontFamily,
    },
  },
  spacing: {
    paragraphGap: 0,
    leadingParagraphGap: 0,
    listBlockMarginTop: 0,
    listBlockMarginBottom: 0,
    listItemGap: 8,
    headingMarginBottom: 0,
  },
};

export function mergeDeepThinkingTheme(
  partial?: Partial<DeepThinkingTheme>,
): DeepThinkingTheme {
  if (!partial) return defaultDeepThinkingTheme;
  return {
    ...defaultDeepThinkingTheme,
    ...partial,
    icon: { ...defaultDeepThinkingTheme.icon, ...partial.icon },
    iconInner: { ...defaultDeepThinkingTheme.iconInner, ...partial.iconInner },
    label: { ...defaultDeepThinkingTheme.label, ...partial.label },
    labelWrap: { ...defaultDeepThinkingTheme.labelWrap, ...partial.labelWrap },
    chevron: { ...defaultDeepThinkingTheme.chevron, ...partial.chevron },
    bodyContainer: {
      ...defaultDeepThinkingTheme.bodyContainer,
      ...partial.bodyContainer,
    },
  };
}

export const defaultDeepThinkingLabels = {
  thinking: 'Thinking…',
  completed: 'Thinking Completed',
  failed: 'Thinking failed',
} as const;
