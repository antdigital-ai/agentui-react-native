import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageList } from '../src/MessageList';
import { MarkdownThemeProvider } from '../src/theme/MarkdownThemeProvider';
import type { ChatMessage } from '../src/MessageList/types';

const messages: ChatMessage[] = [
  { id: 'u1', role: 'user', content: 'Hello' },
  {
    id: 'a1',
    role: 'assistant',
    content: '# Hi\n\n**bold**',
    isFinished: true,
  },
];

const wrap = (ui: React.ReactElement) =>
  render(<MarkdownThemeProvider>{ui}</MarkdownThemeProvider>);

describe('MessageList', () => {
  it('renders user and assistant bubbles', () => {
    const { getByTestId } = wrap(
      <MessageList messages={messages} autoScrollToBottom={false} />,
    );
    expect(getByTestId('message-bubble-user')).toBeTruthy();
    expect(getByTestId('message-bubble-assistant')).toBeTruthy();
    expect(getByTestId('message-list')).toBeTruthy();
  });
});
