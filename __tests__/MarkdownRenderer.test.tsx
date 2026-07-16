import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { MarkdownRenderer } from '../src/MarkdownRenderer/MarkdownRenderer';
import { MarkdownThemeProvider } from '../src/theme/MarkdownThemeProvider';
import { agenticColors } from '../src/theme/agenticTokens';
import { figmaHomeSpacing } from '../src/theme/figmaHomeSpacing';
import type { MarkdownRendererEleProps } from '../src/MarkdownRenderer/types';

const wrap = (ui: React.ReactElement) =>
  render(<MarkdownThemeProvider>{ui}</MarkdownThemeProvider>);

describe('MarkdownRenderer', () => {
  it('renders heading and paragraph', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer content={'# Title\n\nHello **world**'} />,
    );
    expect(getByTestId('markdown-heading-1')).toBeTruthy();
    expect(getByTestId('markdown-paragraph')).toBeTruthy();
  });

  it('renders fenced code block', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer content={'```ts\nconst x = 1\n```'} />,
    );
    expect(getByTestId('markdown-code-block')).toBeTruthy();
  });

  it('renders compact Figma home markdown link', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content="Official website: [https://arbitrum.io/](https://arbitrum.io/)"
      />,
    );
    expect(getByTestId('markdown-link')).toBeTruthy();
  });

  it('renders agent-card JSON fence', () => {
    const json = JSON.stringify({
      title: 'BTC-PERP',
      highlight: '72,732.45 · -2.63%',
      fields: [{ label: 'Subtext', value: 'Subtext line' }],
    });
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={`\`\`\`agent-card\n${json}\n\`\`\``}
      />,
    );
    expect(getByTestId('markdown-agent-card')).toBeTruthy();
    expect(getByText('BTC-PERP')).toBeTruthy();
    expect(getByText(/72,732.45/)).toBeTruthy();
  });

  it('renders compact gfm table rows', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'| header | value |\n| --- | --- |\n| 24H Volume | $456.20 M |'}
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(getByText('24H Volume')).toBeTruthy();
    expect(getByText('$456.20 M')).toBeTruthy();
  });

  it('invokes eleRender for table and forwards ScrollView props', () => {
    const onScrollBeginDrag = jest.fn();
    const eleRender = jest.fn(
      (props: MarkdownRendererEleProps, defaultDom: React.ReactNode) => {
        if (props.tagName === 'table') {
          return React.cloneElement(
            defaultDom as React.ReactElement<ScrollViewProps>,
            { horizontal: true, scrollEnabled: true, onScrollBeginDrag },
          );
        }
        return defaultDom;
      },
    );
    const { getByTestId, UNSAFE_getAllByType } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        eleRender={eleRender}
        content={'| header | value |\n| --- | --- |\n| 24H Volume | $456.20 M |'}
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(eleRender).toHaveBeenCalled();
    expect(
      eleRender.mock.calls.some(
        ([props]: [MarkdownRendererEleProps, React.ReactNode]) =>
          props.tagName === 'table',
      ),
    ).toBe(true);
    const tableScroll = UNSAFE_getAllByType(ScrollView).find(
      (node) => node.props.onScrollBeginDrag === onScrollBeginDrag,
    );
    expect(tableScroll).toBeTruthy();
    expect(tableScroll?.props.horizontal).toBe(true);
    expect(tableScroll?.props.scrollEnabled).toBe(true);
  });

  it('uses horizontal scrolling and minimum cell widths for wide tables', () => {
    const { getAllByTestId, UNSAFE_getAllByType } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={
          '| A | B | C | D |\n| --- | --- | --- | --- |\n| 1 | 2 | 3 | 4 |'
        }
      />,
    );
    const tableScroll = UNSAFE_getAllByType(ScrollView)[0];
    expect(tableScroll.props.horizontal).toBe(true);
    expect(tableScroll.props.scrollEnabled).toBe(true);
    for (const cell of getAllByTestId('markdown-table-cell')) {
      expect(StyleSheet.flatten(cell.props.style).minWidth).toBe(96);
    }
  });

  it('switches a three-column table to horizontal scrolling in a narrow container', () => {
    const { getByTestId, UNSAFE_getAllByType } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'| A | B | C |\n| --- | --- | --- |\n| 1 | 2 | 3 |'}
      />,
    );
    expect(UNSAFE_getAllByType(ScrollView)[0].props.horizontal).toBe(false);
    fireEvent(getByTestId('markdown-table'), 'layout', {
      nativeEvent: { layout: { width: 250, height: 100, x: 0, y: 0 } },
    });
    expect(UNSAFE_getAllByType(ScrollView)[0].props.horizontal).toBe(true);
  });

  it('renders hr full-width with Figma Home vertical margin', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'段首结论\n\n---\n\n## 产品化'}
      />,
    );
    const hr = getByTestId('markdown-hr');
    expect(hr).toBeTruthy();
    const style = StyleSheet.flatten(hr.props.style);
    expect(style.width).toBe('100%');
    expect(style.height).toBe(1);
    expect(style.marginHorizontal).toBe(0);
    expect(style.marginVertical).toBe(figmaHomeSpacing.hrMarginVertical);
    expect(style.backgroundColor).toBe(agenticColors.figmaHome.tableRowBorder);
  });

  it('wraps long table cell text within bubble width', () => {
    const longValue =
      'did:anvita:0x169b9fd401bf4be4f6f7market-information-discovery-service';
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={`| 字段 | 值 |\n| --- | --- |\n| Agent 能力 | ${longValue} |`}
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(getByText(longValue)).toBeTruthy();
  });

  it('keeps long chinese capability text intact with wrapping', () => {
    const longValue =
      '分析多个资产的最新市场趋势和关键数据，生成研究报告';
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={`| Agent | 能力范围 |\n| --- | --- |\n| Asset Research (资产研究) | ${longValue} |`}
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(getByText(longValue)).toBeTruthy();
    expect(getByText('Asset Research (资产研究)')).toBeTruthy();
  });

  it('renders table with empty cells without crashing', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'| 字段 | 值 |\n| --- | --- |\n| 用户名 |  |\n|  | 在线 |'}
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(getByText('用户名')).toBeTruthy();
    expect(getByText('在线')).toBeTruthy();
  });

  it('hides placeholder tables with only empty body rows', () => {
    const { queryByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'| 字段 | 数值 |\n| --- | --- |\n| | |\n| | |'}
      />,
    );
    expect(queryByTestId('markdown-table')).toBeNull();
  });

  it('skips empty body rows but keeps populated rows', () => {
    const { getAllByTestId, getByTestId, getByText, queryByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={
          '| 字段 | 数值 |\n| --- | --- |\n| | |\n| 价格 | $1,770.31 |\n| | |'
        }
      />,
    );
    expect(getByTestId('markdown-table')).toBeTruthy();
    expect(getByText('价格')).toBeTruthy();
    expect(getByText('$1,770.31')).toBeTruthy();
    expect(queryByText('| | |')).toBeNull();
    const rows = getAllByTestId('markdown-table-row');
    expect(rows).toHaveLength(2);
    expect(
      StyleSheet.flatten(rows[1].props.style).borderBottomWidth,
    ).toBeUndefined();
  });

  it('renders plain assistant text via Text fast path', () => {
    const content =
      'This is a portfolio/position analysis request — routing to the Position Analysis specialist.';
    const { getByText } = wrap(
      <MarkdownRenderer layoutDensity="compact" content={content} isFinished />,
    );
    expect(getByText(content)).toBeTruthy();
  });

  it('renders unordered list item text', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer content={'- Bull point one\n- Bull point two'} />,
    );
    expect(getByTestId('markdown-list-unordered')).toBeTruthy();
    expect(getByText('Bull point one')).toBeTruthy();
    expect(getByText('Bull point two')).toBeTruthy();
  });

  it('indents nested lists in compact layout', () => {
    const { getAllByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'- Outer\n  - Nested one\n  - Nested two'}
      />,
    );
    const lists = getAllByTestId('markdown-list-unordered');
    expect(lists.length).toBeGreaterThanOrEqual(2);
    const nested = lists.find(
      (node) => StyleSheet.flatten(node.props.style).paddingLeft === 20,
    );
    expect(nested).toBeTruthy();
    expect(getByText('Nested one')).toBeTruthy();
  });

  it('zeros top margin on the first compact section heading even if not h4', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'Intro line\n\n## What this means\n\nBody'}
      />,
    );
    const heading = getByTestId('markdown-heading-2');
    expect(StyleSheet.flatten(heading.props.style).marginTop).toBe(0);
  });

  it('applies Figma Home colors to compact blockquotes', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'> Disclaimer quote'}
      />,
    );
    const style = StyleSheet.flatten(getByTestId('markdown-blockquote').props.style);
    expect(style.borderLeftColor).toBe(agenticColors.figmaHome.tableRowBorder);
    expect(style.paddingLeft).toBe(12);
    expect(style.paddingTop).toBe(8);
  });

  it('renders font tag color and size in list text', () => {
    const { getAllByTestId, getByText } = wrap(
      <MarkdownRenderer
        content={
          '- 24h Change: <font color="#FF5B5B">+3.2%</font>\n- 72h Change: <font color="#00A870">-1.28%</font>'
        }
      />,
    );
    expect(getAllByTestId('markdown-font').length).toBe(2);
    expect(getByText('+3.2%')).toBeTruthy();
    expect(getByText('-1.28%')).toBeTruthy();
  });

  it('uses leading paragraph gap only on the first split block', () => {
    const { getAllByTestId } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'First block line\n\nSecond block line'}
      />,
    );
    const paragraphs = getAllByTestId('markdown-paragraph');
    expect(paragraphs).toHaveLength(2);
    const firstGap = StyleSheet.flatten(paragraphs[0].props.style).marginBottom;
    const secondGap = StyleSheet.flatten(paragraphs[1].props.style).marginBottom;
    expect(firstGap).toBe(figmaHomeSpacing.contentBlockGap);
    expect(secondGap).toBe(figmaHomeSpacing.listItemGap);
  });

  it('completes incomplete ** markup while streaming (Streamdown remend)', () => {
    const ui = (content: string) => (
      <MarkdownThemeProvider>
        <MarkdownRenderer
          streaming
          throttleOptions={{ enabled: false }}
          content={content}
        />
      </MarkdownThemeProvider>
    );
    const { rerender, getByText } = render(ui('Line **bold'));
    expect(getByText('bold')).toBeTruthy();
    rerender(ui('Line **bold**'));
    expect(getByText('bold')).toBeTruthy();
  });

  it('applies updated theme spacing after rerender', () => {
    const ui = (gap: number) => (
      <MarkdownThemeProvider>
        <MarkdownRenderer
          content={'Hello\n\nWorld'}
          theme={{
            spacing: {
              paragraphGap: gap,
              leadingParagraphGap: gap,
            },
          }}
        />
      </MarkdownThemeProvider>
    );
    const { rerender, getAllByTestId } = render(ui(4));
    expect(
      StyleSheet.flatten(getAllByTestId('markdown-paragraph')[0].props.style)
        .marginBottom,
    ).toBe(4);
    rerender(ui(99));
    expect(
      StyleSheet.flatten(getAllByTestId('markdown-paragraph')[0].props.style)
        .marginBottom,
    ).toBe(99);
  });

  it('renders red font tag in compact stat line', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        content={'**72,732.45** · <font color="#FF5B5B">-2.63%</font>'}
      />,
    );
    expect(getByText('-2.63%')).toBeTruthy();
    expect(getByTestId('markdown-font')).toBeTruthy();
  });

  it('renders blockquote body text', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer content={'Intro\n\n> Quote line one\n> line two\n\nAfter'} />,
    );
    expect(getByTestId('markdown-blockquote')).toBeTruthy();
    expect(getByText(/Quote line one/)).toBeTruthy();
  });

  it('renders blockquote while streaming without throwing', () => {
    const ui = (content: string) => (
      <MarkdownThemeProvider>
        <MarkdownRenderer
          streaming
          throttleOptions={{ enabled: false }}
          content={content}
        />
      </MarkdownThemeProvider>
    );
    const { rerender, getByTestId, getByText } = render(ui('> Streaming quote'));
    expect(getByTestId('markdown-renderer')).toBeTruthy();
    rerender(ui('> Streaming quote complete\n\nNext'));
    expect(getByTestId('markdown-blockquote')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
  });

  it('renders final blockquote when stream ends with isFinished but no trailing newline', () => {
    const content = 'Intro\n\n> 以上为信息与分析，投资决策请你自行判断。';
    const { getByText } = wrap(
      <MarkdownRenderer
        streaming
        isFinished
        throttleOptions={{ enabled: false }}
        content={content}
      />,
    );
    expect(getByText(/以上为信息与分析/)).toBeTruthy();
  });

  it('renders portfolio tail sections when stream finishes with isFinished', () => {
    const content = `你的组合当前总值约 **$179.66**。

Data note: 测试网资产（Pharos_Testnet）已排除。

## What this means

- **集中度（HHI 0.375）**：说明文字。

> 以上为信息与分析，投资决策请你自行判断。`;
    const { getByText } = wrap(
      <MarkdownRenderer
        layoutDensity="compact"
        streaming
        isFinished
        throttleOptions={{ enabled: false }}
        content={content}
      />,
    );
    expect(getByText(/What this means/)).toBeTruthy();
    expect(getByText(/Pharos_Testnet/)).toBeTruthy();
    expect(getByText(/以上为信息与分析/)).toBeTruthy();
  });

  it('renders inline html span and br without throwing', () => {
    const { getByText } = wrap(
      <MarkdownRenderer content={'Alpha<span>beta</span><br>gamma'} />,
    );
    expect(getByText(/Alpha/)).toBeTruthy();
    expect(getByText(/beta/)).toBeTruthy();
    expect(getByText(/gamma/)).toBeTruthy();
  });

  it('strips unsupported html tags to visible text', () => {
    const { getByText } = wrap(
      <MarkdownRenderer content={'Before<custom>Hidden</custom>After'} />,
    );
    expect(getByText('BeforeHiddenAfter')).toBeTruthy();
  });

  it('preserves fenced code whitespace on native', () => {
    const { getByTestId } = wrap(
      <MarkdownRenderer content={'```ts\n  indented\n```'} />,
    );
    const code = getByTestId('markdown-fenced-code');
    const style = StyleSheet.flatten(code.props.style);
    expect(style.whiteSpace).toBe('pre');
  });

  it('renders heading after closing fence glued on same line', () => {
    const content = ['```tsx', 'const x = 1;', '```### 设计要点', '', '正文'].join(
      '\n',
    );
    const { getByTestId } = wrap(<MarkdownRenderer content={content} />);
    expect(getByTestId('markdown-code-block')).toBeTruthy();
    expect(getByTestId('markdown-heading-3')).toBeTruthy();
  });
});
