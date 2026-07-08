import type { ChatMessageThinking } from '../DeepThinking/types';
import type { ChatMessage, MessageBubbleProps } from './types';

function thinkingEqual(
  a: ChatMessageThinking | undefined,
  b: ChatMessageThinking | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  return (
    a.status === b.status &&
    a.label === b.label &&
    a.body === b.body &&
    a.expandable === b.expandable &&
    a.defaultExpanded === b.defaultExpanded &&
    a.showExpandChevron === b.showExpandChevron &&
    a.labels === b.labels
  );
}

function messageEqual(a: ChatMessage, b: ChatMessage): boolean {
  return (
    a.id === b.id &&
    a.role === b.role &&
    a.content === b.content &&
    a.streaming === b.streaming &&
    a.isFinished === b.isFinished &&
    thinkingEqual(a.thinking, b.thinking)
  );
}

/** Skip re-render when another row streams or list length unchanged for this bubble. */
export function messageBubblePropsAreEqual(
  prev: MessageBubbleProps,
  next: MessageBubbleProps,
): boolean {
  // Streaming rows must always re-render: hosts often mutate message.content in place
  // on the same object reference, which makes field-wise equality look unchanged.
  if (prev.message.streaming || next.message.streaming) {
    return false;
  }
  return (
    prev.isLast === next.isLast &&
    prev.layoutDensity === next.layoutDensity &&
    prev.chatTheme === next.chatTheme &&
    prev.throttleOptions === next.throttleOptions &&
    messageEqual(prev.message, next.message)
  );
}
