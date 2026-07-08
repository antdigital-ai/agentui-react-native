import { messageBubblePropsAreEqual } from '../src/MessageList/messageBubblePropsAreEqual';
import type { ChatMessage } from '../src/MessageList/types';
import type { MessageBubbleProps } from '../src/MessageList/types';
import { defaultChatTheme } from '../src/MessageList/chatTheme';

describe('messageBubblePropsAreEqual', () => {
  const baseProps = (message: ChatMessage): MessageBubbleProps => ({
    message,
    chatTheme: defaultChatTheme,
    isLast: true,
  });

  it('always re-renders streaming messages even when the same object reference is reused', () => {
    const message: ChatMessage = {
      id: 'a1',
      role: 'assistant',
      content: '请告诉我',
      streaming: true,
    };
    const prev = baseProps(message);
    message.content = '请告诉我你要分析的资产名称，我会帮你分析。';
    const next = baseProps(message);
    expect(messageBubblePropsAreEqual(prev, next)).toBe(false);
  });

  it('can skip re-render for stable completed messages', () => {
    const message: ChatMessage = {
      id: 'a1',
      role: 'assistant',
      content: 'Done',
      isFinished: true,
    };
    const prev = baseProps(message);
    const next = baseProps({ ...message });
    expect(messageBubblePropsAreEqual(prev, next)).toBe(true);
  });
});
