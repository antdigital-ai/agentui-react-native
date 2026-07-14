import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
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
  FIGMA_HOME_LINK_ICON_SIZE,
  markdownLinkIconSource,
} from './markdownLinkFigma';
import { shouldRenderUrlAsPlainText } from './utils/urlSafety';
import { fencedPreCodeMeta, parseAgentCardJson } from './agentCard';
import { AgentCardView } from './AgentCardView';
import { useBlockLayout } from './blockLayout';
import { wrapInlineChildren, wrapViewChildren } from './wrapViewChildren';

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

const tableRowBorderStyle = (theme: MarkdownTheme): ViewStyle => ({
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
});

const tableCellPaddingStyle = (theme: MarkdownTheme): ViewStyle => ({
  paddingVertical: theme.spacing.tableCellPadding,
  paddingHorizontal: theme.spacing.tableCellPadding,
});

const tableCellTextStyle = (
  theme: MarkdownTheme,
  columnIndex: number,
  isHeaderCell: boolean,
): TextStyle => {
  const typography =
    isHeaderCell || columnIndex === 0
      ? theme.typography.tableLabel
      : theme.typography.tableValue;
  const color =
    isHeaderCell || columnIndex === 0
      ? theme.colors.textMuted
      : theme.colors.text;
  return { ...typography, color };
};

const tableCellWebClass = (
  isHeaderCell: boolean,
  columnIndex: number,
): string => {
  if (isHeaderCell) {
    return 'agentui-markdown-table-cell agentui-markdown-table-th agentui-markdown-table-label-col';
  }
  const role = columnIndex === 0 ? 'label-col' : 'value-col';
  return `agentui-markdown-table-cell agentui-markdown-table-td agentui-markdown-table-${role}`;
};

type HastNode = {
  tagName?: string;
  children?: HastNode[];
  value?: string;
};

const hastNodeText = (node: HastNode | undefined): string => {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(hastNodeText).join('');
};

const hastRowHasVisibleCells = (row: HastNode | undefined): boolean => {
  if (row?.tagName !== 'tr') return false;
  return (row.children ?? []).some((cell) => {
    if (cell.tagName !== 'td' && cell.tagName !== 'th') return false;
    return hastNodeText(cell).trim().length > 0;
  });
};

const hastRowCellHasContent = (
  row: HastNode | undefined,
  columnIndex: number,
): boolean => {
  if (row?.tagName !== 'tr') return true;
  const cells = (row.children ?? []).filter(
    (cell) => cell.tagName === 'td' || cell.tagName === 'th',
  );
  const cell = cells[columnIndex];
  if (!cell) return false;
  return hastNodeText(cell).trim().length > 0;
};

const tableAstHasVisibleBodyRows = (node: unknown): boolean => {
  if (!node || typeof node !== 'object') return true;
  const table = node as HastNode;
  if (table.tagName !== 'table') return true;
  let foundBodySection = false;
  for (const section of table.children ?? []) {
    if (section.tagName === 'tbody') {
      foundBodySection = true;
      if ((section.children ?? []).some(hastRowHasVisibleCells)) return true;
    }
    if (section.tagName === 'tr' && hastRowHasVisibleCells(section)) {
      return true;
    }
  }
  return foundBodySection ? false : true;
};

type ReportColumnWidth = (columnIndex: number, width: number) => void;

type TableLayoutMode = 'fill' | 'scroll';

type TableColumnContextValue = {
  layoutMode: TableLayoutMode;
  layoutReady: boolean;
  widths: number[];
  report: ReportColumnWidth;
};

const noopReport: ReportColumnWidth = () => {};

const EMPTY_WIDTHS: number[] = [];

const sumColumnWidths = (widths: number[]): number =>
  widths.reduce((total, width) => total + (width ?? 0), 0);

const TableColumnContext = React.createContext<TableColumnContextValue | null>(
  null,
);

const defaultTableContext: TableColumnContextValue = {
  // Unconstrained until MarkdownTable measures — fill would shrink cells and
  // under-report natural column widths (horizontal scroll never enables).
  layoutMode: 'scroll',
  layoutReady: false,
  widths: EMPTY_WIDTHS,
  report: noopReport,
};

const useTableColumnWidths = (): TableColumnContextValue => {
  const ctx = React.useContext(TableColumnContext);
  return ctx ?? defaultTableContext;
};

const scheduleFrame = (cb: () => void): number => {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(cb);
  }
  return setTimeout(cb, 16) as unknown as number;
};

const cancelFrame = (handle: number): void => {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle);
    return;
  }
  clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
};

type MarkdownTableProps = {
  theme: MarkdownTheme;
  body: TextStyle;
  children: React.ReactNode;
  node?: unknown;
};

const tableSectionStyle = (layoutMode: TableLayoutMode): ViewStyle =>
  layoutMode === 'fill'
    ? { width: '100%', alignSelf: 'stretch' }
    : { alignSelf: 'flex-start' };

const MarkdownTable: React.FC<MarkdownTableProps> = ({
  theme,
  body,
  children,
  node,
}) => {
  if (!tableAstHasVisibleBodyRows(node)) {
    return null;
  }
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [widths, setWidths] = React.useState<number[]>(EMPTY_WIDTHS);
  const measuredRef = React.useRef<number[]>([]);
  const frameRef = React.useRef<number | null>(null);

  const flush = React.useCallback(() => {
    frameRef.current = null;
    setWidths((prev) => {
      const measured = measuredRef.current;
      let changed = prev.length !== measured.length;
      if (!changed) {
        for (let i = 0; i < measured.length; i += 1) {
          if ((prev[i] ?? 0) !== (measured[i] ?? 0)) {
            changed = true;
            break;
          }
        }
      }
      return changed ? measured.slice() : prev;
    });
  }, []);

  const report = React.useCallback<ReportColumnWidth>(
    (columnIndex, width) => {
      const current = measuredRef.current[columnIndex] ?? 0;
      if (width <= current) return;
      measuredRef.current[columnIndex] = width;
      if (frameRef.current == null) {
        frameRef.current = scheduleFrame(flush);
      }
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (frameRef.current != null) cancelFrame(frameRef.current);
    },
    [],
  );

  const columnsMeasured =
    containerWidth > 0 && sumColumnWidths(widths) > 0;
  const contentOverflows =
    columnsMeasured && sumColumnWidths(widths) > containerWidth + 1;
  // Measure with unconstrained (scroll) layout first; only fill when content fits.
  // Starting in fill shrinks cells (minWidth: 0) so onLayout under-reports width and
  // scroll stays disabled while overflow:hidden still clips text.
  const layoutMode: TableLayoutMode =
    !columnsMeasured || contentOverflows ? 'scroll' : 'fill';

  const contextValue = React.useMemo<TableColumnContextValue>(
    () => ({ layoutMode, layoutReady: columnsMeasured, widths, report }),
    [layoutMode, columnsMeasured, widths, report],
  );

  const handleContainerLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth((prev) => (prev === width ? prev : width));
    }
  }, []);

  const tableBlockStyle: ViewStyle = {
    width: '100%',
    alignSelf: 'stretch',
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: theme.spacing.tableBlockMarginVertical,
    overflow: 'hidden',
  };

  const scrollViewStyle: ViewStyle = {
    width: '100%',
    // Prefer horizontal pans on nested MessageList FlatList (esp. RN Web / WebView).
    ...(Platform.OS === 'web' && contentOverflows
      ? ({ touchAction: 'pan-x' } as ViewStyle)
      : null),
  };

  return (
    <View
      testID="markdown-table"
      {...webClassName(
        contentOverflows
          ? 'agentui-markdown-table agentui-markdown-table--scrollable'
          : 'agentui-markdown-table',
      )}
      style={tableBlockStyle}
      onLayout={handleContainerLayout}
    >
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        scrollEnabled={contentOverflows}
        showsHorizontalScrollIndicator={contentOverflows}
        bounces={contentOverflows}
        overScrollMode={contentOverflows ? 'auto' : 'never'}
        style={scrollViewStyle}
        contentContainerStyle={
          layoutMode === 'fill' ? { minWidth: '100%' } : undefined
        }
      >
        <TableColumnContext.Provider value={contextValue}>
          <View style={tableSectionStyle(layoutMode)}>
            {wrapViewChildren(children, body)}
          </View>
        </TableColumnContext.Provider>
      </ScrollView>
    </View>
  );
};

type MarkdownTableCellProps = {
  theme: MarkdownTheme;
  columnIndex: number;
  isHeaderCell: boolean;
  layoutMode: TableLayoutMode;
  columnWidth?: number;
  reportWidth: ReportColumnWidth;
  hasContent: boolean;
  children: React.ReactNode;
};

// Props injected onto th/td elements by the `tr` renderer via cloneElement.
type TableCellInjectedProps = {
  columnIndex?: number;
  layoutMode?: TableLayoutMode;
  columnWidth?: number;
  reportWidth?: ReportColumnWidth;
  hasContent?: boolean;
};

const MarkdownTableCellBase: React.FC<MarkdownTableCellProps> = ({
  theme,
  columnIndex,
  isHeaderCell,
  layoutMode,
  columnWidth,
  reportWidth,
  hasContent,
  children,
}) => {
  const cellTextStyle = tableCellTextStyle(theme, columnIndex, isHeaderCell);
  const horizontalPadding = theme.spacing.tableCellPadding * 2;
  const verticalPadding = theme.spacing.tableCellPadding * 2;
  // Reserve one text line so empty cells in populated rows keep a consistent height.
  const lineHeight =
    hasContent && typeof cellTextStyle.lineHeight === 'number'
      ? cellTextStyle.lineHeight
      : undefined;

  const handleContentLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0) {
        reportWidth(columnIndex, width + horizontalPadding);
      }
    },
    [columnIndex, horizontalPadding, reportWidth],
  );

  const cellLayoutStyle: ViewStyle =
    layoutMode === 'fill'
      ? { flex: 1, minWidth: 0 }
      : {
          flexGrow: 0,
          flexShrink: 0,
          ...(columnWidth ? { width: columnWidth } : undefined),
        };

  // Keep scroll-mode text on one line so natural width measures correctly.
  const measureTextStyle: TextStyle =
    layoutMode === 'scroll'
      ? ({
          ...cellTextStyle,
          flexShrink: 0,
          ...(Platform.OS === 'web'
            ? ({ whiteSpace: 'nowrap' } as TextStyle)
            : null),
        } as TextStyle)
      : cellTextStyle;

  return (
    <View
      {...webClassName(tableCellWebClass(isHeaderCell, columnIndex))}
      style={{
        ...tableCellPaddingStyle(theme),
        ...cellLayoutStyle,
        justifyContent: 'center',
        ...(lineHeight != null
          ? { minHeight: lineHeight + verticalPadding }
          : undefined),
        backgroundColor: isHeaderCell
          ? theme.colors.tableHeaderBackground
          : undefined,
      }}
    >
      <View
        style={{
          alignSelf: 'flex-start',
          ...(layoutMode === 'scroll' ? { flexShrink: 0 } : null),
          ...(lineHeight ? { minHeight: lineHeight } : undefined),
        }}
        onLayout={handleContentLayout}
      >
        {wrapViewChildren(children, measureTextStyle)}
      </View>
    </View>
  );
};

const MarkdownTableCell = React.memo(MarkdownTableCellBase);

type MarkdownTableRowProps = {
  theme: MarkdownTheme;
  body: TextStyle;
  rowNode?: unknown;
  children: React.ReactNode;
};

const MarkdownTableRowBase: React.FC<MarkdownTableRowProps> = ({
  theme,
  body,
  rowNode,
  children,
}) => {
  const { layoutMode, widths, report } = useTableColumnWidths();
  const cells = React.Children.toArray(children);
  const astRow = rowNode as HastNode | undefined;

  return (
    <View
      {...webClassName('agentui-markdown-table-row')}
      style={{
        ...tableSectionStyle(layoutMode),
        flexDirection: 'row',
        ...tableRowBorderStyle(theme),
      }}
    >
      {cells.map((cell, index) =>
        React.isValidElement(cell)
          ? React.cloneElement(
              cell as React.ReactElement<TableCellInjectedProps>,
              {
                columnIndex: index,
                layoutMode,
                columnWidth: widths[index],
                reportWidth: report,
                hasContent: hastRowCellHasContent(astRow, index),
              },
            )
          : wrapViewChildren(cell, body),
      )}
    </View>
  );
};

const MarkdownTableRow = React.memo(MarkdownTableRowBase);

export type MarkdownRnComponentsBundle = {
  components: Record<string, React.ComponentType<RendererBlockProps>>;
};

export const buildRnComponents = ({
  theme,
  linkConfig,
  eleRender,
  userComponents,
}: BuildOptions): MarkdownRnComponentsBundle => {
  const body = textColor(theme);
  const emphasis = emphasisStyle(theme);
  const blockquoteTextStyle: TextStyle = {
    ...body,
    color: theme.colors.blockquoteText,
  };

  const heading =
    (level: 1 | 2 | 3 | 4 | 5 | 6): React.FC<RendererBlockProps> =>
    (props) => {
      const { children } = props;
      const layout = useBlockLayout();
      const typo = theme.typography[`h${level}`];
      const levelKey = level as HeadingLevel;
      const margins =
        theme.headingMarginByLevel[levelKey] ?? headingMarginsDesktop[levelKey];
      const seen = layout.sectionHeadingIndex[levelKey] ?? 0;
      layout.sectionHeadingIndex[levelKey] = seen + 1;
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
          {wrapInlineChildren(children)}
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
          {wrapViewChildren(children, body)}
        </View>
      );
      return applyEleRender(eleRender, 'div', props as MarkdownRendererEleProps, defaultDom);
    },

    p: (props) => {
      const { children } = props;
      const layout = useBlockLayout();
      const inList = props.inListItem === true;
      let marginBottom = theme.spacing.paragraphGap;
      if (inList) {
        marginBottom = 0;
      } else {
        const isLeading = layout.paragraphIndex === 0;
        layout.paragraphIndex += 1;
        marginBottom =
          isLeading && layout.isFirstBlockInDocument
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
            {wrapInlineChildren(children)}
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
      <Text style={emphasis}>{wrapInlineChildren(props.children)}</Text>
    ),
    em: (props) => (
      <Text style={{ fontStyle: 'italic' }}>{wrapInlineChildren(props.children)}</Text>
    ),
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
          {wrapInlineChildren(children)}
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
      <Text style={{ textDecorationLine: 'line-through' }}>
        {wrapInlineChildren(props.children)}
      </Text>
    ),
    span: (props) => <Text style={body}>{wrapInlineChildren(props.children)}</Text>,
    br: () => <Text style={body}>{'\n'}</Text>,
    u: (props) => (
      <Text style={{ textDecorationLine: 'underline' }}>
        {wrapInlineChildren(props.children)}
      </Text>
    ),
    mark: (props) => (
      <Text
        style={{
          backgroundColor: theme.colors.codeBackground,
          color: theme.colors.text,
        }}
      >
        {wrapInlineChildren(props.children)}
      </Text>
    ),
    sub: (props) => {
      const baseSize = typeof body.fontSize === 'number' ? body.fontSize : 14;
      return (
        <Text style={{ fontSize: baseSize * 0.85, lineHeight: baseSize * 0.95 }}>
          {wrapInlineChildren(props.children)}
        </Text>
      );
    },
    sup: (props) => {
      const baseSize = typeof body.fontSize === 'number' ? body.fontSize : 14;
      return (
        <Text style={{ fontSize: baseSize * 0.85, lineHeight: baseSize * 0.95 }}>
          {wrapInlineChildren(props.children)}
        </Text>
      );
    },

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
        <Text
          onPress={onPress}
          accessibilityRole="link"
          testID="markdown-link"
          {...webClassName('agentui-markdown-link agentui-markdown-link-with-icon')}
          style={linkTextStyle}
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
          {wrapInlineChildren(children)}
        </Text>
      ) : (
        <Text
          testID="markdown-link"
          style={linkTextStyle}
          onPress={onPress}
          {...webClassName('agentui-markdown-link')}
        >
          {wrapInlineChildren(children)}
        </Text>
      );
      return applyEleRender(eleRender, 'a', props as MarkdownRendererEleProps, defaultDom);
    },

    ul: (props) => {
      const items = React.Children.toArray(props.children);
      const lastLiIndex = (() => {
        for (let i = items.length - 1; i >= 0; i--) {
          if (React.isValidElement(items[i])) return i;
        }
        return -1;
      })();
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
            if (!React.isValidElement(child)) {
              return wrapViewChildren(child, body);
            }
            return React.cloneElement(
              child as React.ReactElement<{ isLastListItem?: boolean }>,
              { isLastListItem: index === lastLiIndex },
            );
          })}
        </View>
      );
    },
    ol: (props) => {
      const items = React.Children.toArray(props.children);
      const lastLiIndex = (() => {
        for (let i = items.length - 1; i >= 0; i--) {
          if (React.isValidElement(items[i])) return i;
        }
        return -1;
      })();
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
            if (!React.isValidElement(child)) {
              return wrapViewChildren(child, body);
            }
            const listIndex =
              items.slice(0, index + 1).filter(React.isValidElement).length;
            return React.cloneElement(
              child as React.ReactElement<{
                listIndex?: number;
                isLastListItem?: boolean;
              }>,
              {
                listIndex,
                isLastListItem: index === lastLiIndex,
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
            {wrapViewChildren(children, body, {
              mapElement: (child) =>
                React.cloneElement(
                  child as React.ReactElement<{ inListItem?: boolean }>,
                  { inListItem: true },
                ),
            })}
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
              paddingTop: theme.spacing.blockquotePadding / 2,
              paddingBottom: theme.spacing.blockquotePadding / 2,
              paddingRight: theme.spacing.blockquotePadding / 2,
              marginBottom: theme.spacing.paragraphGap,
            },
          ]}
        >
          {wrapViewChildren(props.children, blockquoteTextStyle, {
            mapElement: (child) => {
              const paragraph = child as any;
              if (
                React.isValidElement(child) &&
                typeof paragraph.props.testID === 'string' &&
                paragraph.props.testID === 'markdown-paragraph'
              ) {
                return React.cloneElement(child, {
                  style: {
                    ...paragraph.props.style,
                    marginBottom: 0,
                  },
                } as any);
              }
              return child;
            },
          })}
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
              { color: theme.colors.codeText, whiteSpace: 'pre' } as TextStyle,
            ]}
          >
            {wrapInlineChildren(children)}
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
          {wrapInlineChildren(children)}
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
            {wrapViewChildren(props.children, {
              ...theme.typography.code,
              color: theme.colors.codeText,
              whiteSpace: 'pre',
            } as TextStyle)}
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
      <MarkdownTable theme={theme} body={body} node={props.node}>
        {props.children}
      </MarkdownTable>
    ),
    thead: (props) => {
      const { layoutMode } = useTableColumnWidths();
      return (
        <View testID="markdown-table-head" style={tableSectionStyle(layoutMode)}>
          {wrapViewChildren(props.children, body)}
        </View>
      );
    },
    tbody: (props) => {
      const { layoutMode } = useTableColumnWidths();
      return (
        <View testID="markdown-table-body" style={tableSectionStyle(layoutMode)}>
          {wrapViewChildren(props.children, body)}
        </View>
      );
    },
    tr: (props) => {
      if (!hastRowHasVisibleCells(props.node as HastNode)) {
        return null;
      }
      return (
        <MarkdownTableRow theme={theme} body={body} rowNode={props.node}>
          {props.children}
        </MarkdownTableRow>
      );
    },
    th: (props) => {
      const { columnIndex, layoutMode, columnWidth, reportWidth, hasContent } =
        props as TableCellInjectedProps;
      return (
        <MarkdownTableCell
          theme={theme}
          columnIndex={columnIndex ?? 0}
          isHeaderCell
          layoutMode={layoutMode ?? 'scroll'}
          columnWidth={columnWidth}
          reportWidth={reportWidth ?? noopReport}
          hasContent={hasContent ?? true}
        >
          {props.children}
        </MarkdownTableCell>
      );
    },
    td: (props) => {
      const { columnIndex, layoutMode, columnWidth, reportWidth, hasContent } =
        props as TableCellInjectedProps;
      return (
        <MarkdownTableCell
          theme={theme}
          columnIndex={columnIndex ?? 0}
          isHeaderCell={false}
          layoutMode={layoutMode ?? 'scroll'}
          columnWidth={columnWidth}
          reportWidth={reportWidth ?? noopReport}
          hasContent={hasContent ?? true}
        >
          {props.children}
        </MarkdownTableCell>
      );
    },

    input: (props) => {
      if (props.type === 'checkbox') return null;
      return null;
    },

    ...userComponents,
  };

  return { components };
};
