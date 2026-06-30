import React from 'react';
import { render } from '@testing-library/react-native';
import { MarkdownRenderer } from '../src/MarkdownRenderer/MarkdownRenderer';
import { MarkdownThemeProvider } from '../src/theme/MarkdownThemeProvider';

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

  it('renders unordered list item text', () => {
    const { getByTestId, getByText } = wrap(
      <MarkdownRenderer content={'- Bull point one\n- Bull point two'} />,
    );
    expect(getByTestId('markdown-list-unordered')).toBeTruthy();
    expect(getByText('Bull point one')).toBeTruthy();
    expect(getByText('Bull point two')).toBeTruthy();
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
});
