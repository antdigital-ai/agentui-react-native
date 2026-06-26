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
});
