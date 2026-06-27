import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, Platform, type ListRenderItem } from 'react-native';
import { compactChatTheme } from '../theme/mobileTheme';
import { useCompactLayout } from '../theme/useCompactLayout';
import type { LayoutDensity } from '../theme/layout';
import { mergeChatTheme, defaultChatTheme } from './chatTheme';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage, MessageListProps } from './types';
import { webClassName } from '../theme/webClassName';

export function MessageList({
  messages,
  style,
  contentContainerStyle,
  autoScrollToBottom = true,
  throttleOptions,
  chatTheme: chatThemePartial,
  layoutDensity = 'auto',
  testID = 'message-list',
}: MessageListProps) {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const compact = useCompactLayout(layoutDensity);
  const chatTheme = useMemo(
    () =>
      mergeChatTheme(
        defaultChatTheme,
        compact ? compactChatTheme : undefined,
        chatThemePartial,
      ),
    [chatThemePartial, compact],
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

  const renderItem: ListRenderItem<ChatMessage> = ({ item, index }) => (
    <MessageBubble
      message={item}
      chatTheme={chatTheme}
      throttleOptions={throttleOptions}
      layoutDensity={layoutDensity}
      isLast={index === messages.length - 1}
    />
  );

  return (
    <FlatList
      ref={listRef}
      testID={testID}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      {...webClassName('agentui-message-list')}
      style={[
        style,
        Platform.OS === 'web'
          ? { flex: 1, minHeight: 0, width: '100%' }
          : null,
      ]}
      contentContainerStyle={[
        {
          paddingTop: chatTheme.listPaddingTop ?? chatTheme.listPadding,
          paddingBottom: chatTheme.listPaddingBottom ?? chatTheme.listPadding,
          paddingHorizontal:
            chatTheme.listPaddingHorizontal ?? chatTheme.listPadding,
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
