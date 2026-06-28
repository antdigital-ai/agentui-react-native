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
