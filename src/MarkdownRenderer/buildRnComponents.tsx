import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { MarkdownTheme } from '../theme/defaultTheme';
import { headingMargins } from '../theme/headingMargins';
import type {
  MarkdownRendererEleProps,
  MarkdownRendererProps,
  RendererBlockProps,
} from './types';
import { extractLanguageFromClassName } from './utils/astExtract';
import { shouldRenderUrlAsPlainText } from './utils/urlSafety';

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

export const buildRnComponents = ({
  theme,
  linkConfig,
  eleRender,
  userComponents,
}: BuildOptions): Record<string, React.ComponentType<RendererBlockProps>> => {
  const body = textColor(theme);

  const heading =
    (level: 1 | 2 | 3 | 4 | 5 | 6): React.FC<RendererBlockProps> =>
    (props) => {
      const { children } = props;
      const typo = theme.typography[`h${level}`];
      const margins = headingMargins[level];
      const defaultDom = (
        <Text
          accessibilityRole="header"
          testID={`markdown-heading-${level}`}
          style={[
            body,
            typo,
            {
              marginTop: margins.marginTop,
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
      const defaultDom = (
        <View
          testID="markdown-paragraph"
          style={{ marginBottom: theme.spacing.paragraphGap, marginTop: 0 }}
        >
          {children}
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
      <Text style={{ fontWeight: '700' }}>{props.children}</Text>
    ),
    em: (props) => <Text style={{ fontStyle: 'italic' }}>{props.children}</Text>,
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
      const defaultDom = (
        <Text
          testID="markdown-link"
          style={[
            {
              color: theme.colors.link,
              ...theme.typography.body,
              textDecorationLine: 'underline',
              textDecorationColor: theme.colors.linkUnderline,
            },
            Platform.OS === 'web'
              ? ({ cursor: 'pointer', textUnderlineOffset: 4 } as TextStyle)
              : null,
          ]}
          onPress={onPress}
        >
          {children}
        </Text>
      );
      return applyEleRender(eleRender, 'a', props as MarkdownRendererEleProps, defaultDom);
    },

    ul: (props) => (
      <View
        testID="markdown-list-unordered"
        style={{
          marginTop: theme.spacing.paragraphGap,
          marginBottom: theme.spacing.paragraphGap * 2,
          paddingLeft: theme.spacing.listIndent,
        }}
      >
        {props.children}
      </View>
    ),
    ol: (props) => {
      const items = React.Children.toArray(props.children);
      return (
        <View
          testID="markdown-list-ordered"
          style={{
            marginTop: theme.spacing.paragraphGap,
            marginBottom: theme.spacing.paragraphGap * 2,
            paddingLeft: theme.spacing.listIndent,
          }}
        >
          {items.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(child as React.ReactElement, {
              listIndex: index + 1,
            });
          })}
        </View>
      );
    },

    li: (props) => {
      const { children, checked, listIndex } = props as RendererBlockProps & {
        checked?: boolean;
        listIndex?: number;
      };
      const isTask = typeof checked === 'boolean';
      const defaultDom = (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: theme.spacing.listItemGap,
            marginTop: theme.spacing.listItemGap,
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
            <Text style={[body, { marginRight: 6, minWidth: 20 }]}>
              {listIndex != null ? `${listIndex}.` : '\u2022'}
            </Text>
          )}
          <View style={{ flex: 1 }}>{children}</View>
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

    table: (props) => (
      <ScrollView
        horizontal
        testID="markdown-table"
        style={{ marginVertical: 4 }}
      >
        <View>{props.children}</View>
      </ScrollView>
    ),
    thead: (props) => <View>{props.children}</View>,
    tbody: (props) => <View>{props.children}</View>,
    tr: (props) => (
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.border }}>
        {props.children}
      </View>
    ),
    th: (props) => (
      <View
        style={{
          padding: theme.spacing.tableCellPadding,
          minWidth: 80,
          backgroundColor: theme.colors.tableHeaderBackground,
        }}
      >
        <Text style={[body, { fontWeight: '600' }]}>{props.children}</Text>
      </View>
    ),
    td: (props) => (
      <View style={{ padding: theme.spacing.tableCellPadding, minWidth:  80 }}>
        <Text style={body}>{props.children}</Text>
      </View>
    ),

    input: (props) => {
      if (props.type === 'checkbox') return null;
      return null;
    },

    ...userComponents,
  };

  return components;
};
