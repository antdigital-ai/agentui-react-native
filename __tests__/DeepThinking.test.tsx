import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DeepThinking } from '../src/DeepThinking';
import { MarkdownThemeProvider } from '../src/theme/MarkdownThemeProvider';

const wrap = (ui: React.ReactElement) =>
  render(<MarkdownThemeProvider>{ui}</MarkdownThemeProvider>);

describe('DeepThinking', () => {
  it('renders completed label from Figma defaults', () => {
    const { getByTestId, getByText } = wrap(
      <DeepThinking status="completed" />,
    );
    expect(getByTestId('deep-thinking')).toBeTruthy();
    expect(getByText('Thinking Completed')).toBeTruthy();
  });

  it('expands reasoning body on press', () => {
    const { getByTestId, queryByTestId } = wrap(
      <DeepThinking
        status="completed"
        body="Reason step one"
        defaultExpanded={false}
      />,
    );
    expect(queryByTestId('deep-thinking-body')).toBeNull();
    fireEvent.press(getByTestId('deep-thinking-header'));
    expect(getByTestId('deep-thinking-body')).toBeTruthy();
  });
});
