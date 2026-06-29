import React from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { MarkdownTheme } from '../theme/defaultTheme';
import { headingMarginsDesktop, type HeadingLevel } from '../theme/headingMargins';
import { webClassName } from '../theme/webClassName';
import type {
  MarkdownRendererEleProps,
  MarkdownRendererProps,
  RendererBlockProps,
} from './types';
import { extractLanguageFromClassName } from './utils/astExtract';
import { fontTagTextStyle } from './fontStyle';
import {
  FIGMA_HOME_LINK_COLOR,
  FIGMA_HOME_LINK_ICON_GAP,
  FIGMA_HOME_LINK_ICON_SIZE,
  markdownLinkIconSource,
} from './markdownLinkFigma';
import { shouldRenderUrlAsPlainText } from './utils/urlSafety';
import { fencedPreCodeMeta, parseAgentCardJson } from './agentCard';
import { AgentCardView } from './AgentCardView';

type BuildOptions = {
  theme: MarkdownTheme;
  linkConfig?: MarkdownRendererProps['linkConfig'];
  eleRender?: MarkdownRendererProps['eleRender'];
  userComponents: Record<string, React.ComponentType<RendererBlockProps>>;
};

const applyEleRender = (
  eleRender: BuildOptions['eleRender'],
  tagName: string,
  props: MarkdownRendererEleProps,
  defaultDom: React.ReactNode,
): React.ReactNode => {
  if (!eleRender) return defaultDom;
  const result = eleRender({ ...props, tagName }, defaultDom);
  return result !== undefined ? result : defaultDom;
};

const textColor = (theme: MarkdownTheme): TextStyle => ({
  color: theme.colors.text,
  ...theme.typography.body,
});

const emphasisStyle = (theme: MarkdownTheme): TextStyle => ({
  color: theme.colors.text,
  ...theme.typography.emphasis,
});

export const buildRnComponents = ({
  theme,
  linkConfig,
  eleRender,
  userComponents,
}: BuildOptions): Record<string, React.ComponentType<RendererBlockProps>> => {
  const body = textColor(theme);
  const emphasis = emphasisStyle(theme);
  const sectionHeadingIndex: Partial<Record<HeadingLevel, number>> = {};
  let paragraphIndex = 0;

  const heading =
    (level: 1 | 2 | 3 | 4 | 5 | 6): React.FC<RendererBlockProps> =>
    (props) => {
      const { children } = props;
      const typo = theme.typography[`h${level}`];
      const levelKey = level as HeadingLevel;
      const margins =
        theme.headingMarginByLevel[levelKey] ?? headingMarginsDesktop[levelKey];
      const seen = sectionHeadingIndex[levelKey] ?? 0;
      sectionHeadingIndex[levelKey] = seen + 1;
      const marginTop =
        levelKey === 4 && seen === 0 ? 0 : margins.marginTop;
      const defaultDom = (
        <Text
          accessibilityRole="header"
          testID={`markdown-heading-${level}`}
          style={[
            { color: theme.colors.text },
            typo,
            {
              marginTop,
              marginBottom: margins.marginBottom,
            },
          ]}
        >
          {children}
        </Text>
      );
      return applyEleRender(
        eleRender,
        `h${level}`,
        props as MarkdownRendererEleProps,
        defaultDom,
      );
    };

  const components: Record<string, React.ComponentType<RendererBlockProps>> = {
    div: (props) => {
      const { children, style, ...rest } = props;
      const defaultDom = (
        <View {...rest} style={style as ViewStyle}>
          {children}
        </View>
      );
      return applyEleRender(eleRender, 'div', props as MarkdownRendererEleProps, defaultDom);
    },

    p: (props) => {
      const { children } = props;
      const inList = props.inListItem === true;
      let marginBottom = theme.spacing.paragraphGap;
      if (inList) {
        marginBottom = 0;
      } else {
        const isLeading = paragraphIndex === 0;
        paragraphIndex += 1;
        marginBottom = isLeading
          ? theme.spacing.leadingParagraphGap
          : theme.spacing.paragraphGap;
      }
      const defaultDom = (
        <View
          testID="markdown-paragraph"
          style={{ marginBottom, marginTop: 0 }}
        >
          <Text
            style={[
              body,
              Platform.OS === 'web'
                ? ({ marginBlockEnd: 0, paddingBlockEnd: 0 } as TextStyle)
                : null,
              Platform.OS === 'android' ? { includeFontPadding: false } : null,
            ]}
          >
            {children}
          </Text>
        </View>
      );
      return applyEleRender(eleRender, 'p', props as MarkdownRendererEleProps, defaultDom);
    },

    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    h5: heading(5),
    h6: heading(6),

    strong: (props) => (
      <Text style={emphasis}>{props.children}</Text>
    ),
    em: (props) => <Text style={{ fontStyle: 'italic' }}>{props.children}</Text>,
    font: (props) => {
      const { children, color, size } = props as RendererBlockProps & {
        color?: string;
        size?: string;
      };
      const defaultDom = (
        <Text
          testID="markdown-font"
          style={fontTagTextStyle(color, size, body)}
        >
          {children}
        </Text>
      );
      return applyEleRender(
        eleRender,
        'font',
        props as MarkdownRendererEleProps,
        defaultDom,
      );
    },
    del: (props) => (
      <Text style={{ textDecorationLine: 'line-through' }}>{props.children}</Text>
    ),

    a: (props) => {
      const href = (props.href as string) || '';
      const { children } = props;
      if (shouldRenderUrlAsPlainText(href)) {
        return <Text style={body}>{href || children}</Text>;
      }
      const onPress = () => {
        if (linkConfig?.onPress?.(href) === false) return;
        if (href) Linking.openURL(href).catch(() => undefined);
      };
      const linkTextStyle: TextStyle = {
        color: theme.colors.link,
        ...theme.typography.body,
        textDecorationLine: 'underline',
        textDecorationColor: theme.colors.linkUnderline,
        ...(Platform.OS === 'web'
          ? ({ cursor: 'pointer', textUnderlineOffset: 2 } as TextStyle)
          : null),
      };
      const useFigmaLinkChrome = theme.colors.link === FIGMA_HOME_LINK_COLOR;

      const defaultDom = useFigmaLinkChrome ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          testID="markdown-link"
          {...webClassName('agentui-markdown-link agentui-markdown-link-with-icon')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: FIGMA_HOME_LINK_ICON_GAP,
            gap: FIGMA_HOME_LINK_ICON_GAP,
            alignSelf: 'flex-start',
          }}
        >
          <Image
            source={markdownLinkIconSource}
            style={{
              width: FIGMA_HOME_LINK_ICON_SIZE,
              height: FIGMA_HOME_LINK_ICON_SIZE,
            }}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text style={linkTextStyle}>{children}</Text>
        </Pressable>
      ) : (
        <Text
          testID="markdown-link"
          style={linkTextStyle}
          onPress={onPress}
          {...webClassName('agentui-markdown-link')}
        >
          {children}
        </Text>
      );
      return applyEleRender(eleRender, 'a', props as MarkdownRendererEleProps, defaultDom);
    },

    ul: (props) => {
      const items = React.Children.toArray(props.children).filter(
        React.isValidElement,
      );
      const lastIndex = items.length - 1;
      return (
        <View
          testID="markdown-list-unordered"
          style={{
            marginTop: theme.spacing.listBlockMarginTop,
            marginBottom: theme.spacing.listBlockMarginBottom,
            paddingLeft: 0,
          }}
        >
          {items.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(
              child as React.ReactElement<{ isLastListItem?: boolean }>,
              { isLastListItem: index === lastIndex },
            );
          })}
        </View>
      );
    },
    ol: (props) => {
      const items = React.Children.toArray(props.children).filter(
        React.isValidElement,
      );
      const lastIndex = items.length - 1;
      return (
        <View
          testID="markdown-list-ordered"
          style={{
            marginTop: theme.spacing.listBlockMarginTop,
            marginBottom: theme.spacing.listBlockMarginBottom,
            paddingLeft: 0,
          }}
        >
          {items.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(
              child as React.ReactElement<{
                listIndex?: number;
                isLastListItem?: boolean;
              }>,
              {
                listIndex: index + 1,
                isLastListItem: index === lastIndex,
              },
            );
          })}
        </View>
      );
    },

    li: (props) => {
      const { children, checked, listIndex, isLastListItem } = props as RendererBlockProps & {
        checked?: boolean;
        listIndex?: number;
        isLastListItem?: boolean;
      };
      const isTask = typeof checked === 'boolean';
      const itemGap = isLastListItem ? 0 : theme.spacing.listItemGap;
      const defaultDom = (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: itemGap,
            marginTop: 0,
            paddingLeft: 0,
          }}
        >
          {isTask ? (
            <View
              style={{
                width: 18,
                height: 18,
                borderWidth: 1,
                borderColor: theme.colors.taskCheckboxBorder,
                borderRadius: 2,
                marginRight: 8,
                marginTop: 3,
                backgroundColor: checked ? theme.colors.link : 'transparent',
              }}
            />
          ) : (
            <Text style={[body, { width: 20, marginRight: 0, textAlign: 'center' }]}>
              {listIndex != null ? `${listIndex}.` : '\u2022'}
            </Text>
          )}
          <View style={{ flex: 1 }}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(
                    child as React.ReactElement<{ inListItem?: boolean }>,
                    { inListItem: true },
                  )
                : child,
            )}
          </View>
        </View>
      );
      return applyEleRender(
        eleRender,
        'li',
        props as MarkdownRendererEleProps,
        defaultDom,
      );
    },

    blockquote: (props) => {
      const defaultDom = (
        <View
          testID="markdown-blockquote"
          style={[
            theme.blockquote,
            {
              borderLeftColor: theme.colors.blockquoteBorder,
              backgroundColor: theme.colors.blockquoteBackground,
              paddingTop: theme.spacing.blockquotePadding,
              paddingBottom: theme.spacing.blockquotePadding,
              paddingRight: theme.spacing.blockquotePadding,
            },
          ]}
        >
          {props.children}
        </View>
      );
      return applyEleRender(
        eleRender,
        'blockquote',
        props as MarkdownRendererEleProps,
        defaultDom,
      );
    },

    code: (props) => {
      const { children, className } = props;
      const lang = extractLanguageFromClassName(className as string);
      if (lang) {
        return (
          <Text
            testID="markdown-fenced-code"
            style={[
              theme.typography.code,
              { color: theme.colors.codeText },
              Platform.OS === 'web' ? ({ whiteSpace: 'pre' } as TextStyle) : null,
            ]}
          >
            {children}
          </Text>
        );
      }
      return (
        <Text
          testID="markdown-inline-code"
          style={[
            theme.typography.inlineCode,
            {
              backgroundColor: theme.colors.codeBackground,
              color: theme.colors.codeText,
              marginHorizontal: 3,
              marginVertical: 1,
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRadius: 6,
            },
          ]}
        >
          {children}
        </Text>
      );
    },

    pre: (props) => {
      const CodeBlock = userComponents.__codeBlock || userComponents.pre;
      const { lang, text } = fencedPreCodeMeta(props.children);
      if (lang === 'agent-card' && text.trim()) {
        const data = parseAgentCardJson(text);
        if (data) {
          const AgentCardOverride = userComponents.agentCard;
          const cardDom = AgentCardOverride ? (
            <AgentCardOverride data={data} {...props} />
          ) : (
            <AgentCardView data={data} theme={theme} />
          );
          return applyEleRender(
            eleRender,
            'pre',
            props as MarkdownRendererEleProps,
            cardDom,
          );
        }
      }
      if (CodeBlock) {
        return <CodeBlock {...props} />;
      }
      const defaultDom = (
        <View
          testID="markdown-code-block"
          style={{
            backgroundColor: theme.colors.codeBackground,
            borderRadius: 12,
            marginVertical: theme.spacing.paragraphGap,
            padding: theme.spacing.codeBlockPadding,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator>
            {props.children}
          </ScrollView>
        </View>
      );
      return applyEleRender(eleRender, 'pre', props as MarkdownRendererEleProps, defaultDom);
    },

    hr: () => (
      <View
        testID="markdown-hr"
        style={{
          height: 1,
          backgroundColor: theme.colors.hr,
          marginVertical: theme.spacing.paragraphGap * 4,
        }}
      />
    ),

    img: (props) => {
      const src = (props.src as string) || '';
      if (shouldRenderUrlAsPlainText(src)) {
        return <Text style={body}>{src}</Text>;
      }
      return (
        <Image
          testID="markdown-image"
          source={{ uri: src }}
          style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 4 }}
          accessibilityLabel={(props.alt as string) || 'image'}
        />
      );
    },

    table: (props) => {
      const tableBlockStyle: ViewStyle = {
        width: '100%',
        alignSelf: 'stretch',
        marginVertical: theme.spacing.tableBlockMarginVertical,
      };
      const tableInner = (
        <View style={{ width: '100%', alignSelf: 'stretch' }}>
          {props.children}
        </View>
      );
      if (Platform.OS === 'web') {
        return (
          <View
            testID="markdown-table"
            {...webClassName('agentui-markdown-table')}
            style={tableBlockStyle}
          >
            {tableInner}
          </View>
        );
      }
      return (
        <View testID="markdown-table" style={tableBlockStyle}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={{ width: '100%' }}
            contentContainerStyle={{ minWidth: '100%' }}
          >
            {tableInner}
          </ScrollView>
        </View>
      );
    },
    thead: (props) => (
      <View style={{ width: '100%', alignSelf: 'stretch' }}>{props.children}</View>
    ),
    tbody: (props) => (
      <View style={{ width: '100%', alignSelf: 'stretch' }}>{props.children}</View>
    ),
    tr: (props) => {
      const cells = React.Children.toArray(props.children);
      return (
        <View
          style={{
            width: '100%',
            alignSelf: 'stretch',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          {cells.map((cell, index) =>
            React.isValidElement(cell)
              ? React.cloneElement(
                  cell as React.ReactElement<{ columnIndex?: number }>,
                  { columnIndex: index },
                )
              : cell,
          )}
        </View>
      );
    },
    th: (props) => {
      const columnIndex = (props as { columnIndex?: number }).columnIndex ?? 0;
      const cellTextStyle =
        columnIndex === 0
          ? [theme.typography.tableLabel, { color: theme.colors.textMuted }]
          : [theme.typography.tableValue, { color: theme.colors.text }];
      return (
        <View
          style={{
            padding: theme.spacing.tableCellPadding,
            minWidth: 80,
            flex: 1,
            backgroundColor: theme.colors.tableHeaderBackground,
          }}
        >
          <Text style={cellTextStyle}>{props.children}</Text>
        </View>
      );
    },
    td: (props) => {
      const columnIndex = (props as { columnIndex?: number }).columnIndex ?? 0;
      const cellTextStyle =
        columnIndex === 0
          ? [theme.typography.tableLabel, { color: theme.colors.textMuted }]
          : [theme.typography.tableValue, { color: theme.colors.text }];
      return (
        <View style={{ padding: theme.spacing.tableCellPadding, minWidth: 80, flex: 1 }}>
          <Text style={cellTextStyle}>{props.children}</Text>
        </View>
      );
    },

    input: (props) => {
      if (props.type === 'checkbox') return null;
      return null;
    },

    ...userComponents,
  };

  return components;
};
