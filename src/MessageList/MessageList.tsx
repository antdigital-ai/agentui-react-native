import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import { mergeChatTheme, defaultChatTheme } from './chatTheme';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage, MessageListProps } from './types';

export function MessageList({
  messages,
  style,
  contentContainerStyle,
  autoScrollToBottom = true,
  throttleOptions,
  chatTheme: chatThemePartial,
  testID = 'message-list',
}: MessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const chatTheme = useMemo(
    () => mergeChatTheme(defaultChatTheme, chatThemePartial),
    [chatThemePartial],
  );

  const lastContent = messages[messages.length - 1]?.content ?? '';
  const lastId = messages[messages.length - 1]?.id ?? '';

  useEffect(() => {
    if (!autoScrollToBottom || messages.length === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 0);
    return () => clearTimeout(t);
  }, [autoScrollToBottom, messages.length, lastContent, lastId]);

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <MessageBubble
      message={item}
      chatTheme={chatTheme}
      throttleOptions={throttleOptions}
    />
  );

  return (
    <FlatList
      ref={listRef}
      testID={testID}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={style}
      contentContainerStyle={[
        {
          padding: chatTheme.listPadding,
          flexGrow: 1,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        if (autoScrollToBottom && messages.length > 0) {
          listRef.current?.scrollToEnd({ animated: false });
        }
      }}
    />
  );
}
