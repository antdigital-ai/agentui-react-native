import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
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

  const lastMessage = messages[messages.length - 1];
  const lastContent = lastMessage?.content ?? '';
  const lastId = lastMessage?.id ?? '';
  const scrollOnResize = autoScrollToBottom && lastMessage?.streaming === true;

  /** Force FlatList to refresh rows when in-place message mutations reuse array refs. */
  const listExtraData = messages
    .map(
      (m) =>
        `${m.id}:${m.content.length}:${m.streaming ? 1 : 0}:${m.isFinished ? 1 : 0}`,
    )
    .join('|');

  const onContentSizeChange = useCallback(() => {
    if (scrollOnResize && messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: false });
    }
  }, [scrollOnResize, messages.length]);

  const renderItem = useCallback<ListRenderItem<ChatMessage>>(
    ({ item, index }) => (
      <MessageBubble
        message={item}
        chatTheme={chatTheme}
        throttleOptions={throttleOptions}
        layoutDensity={layoutDensity}
        isLast={index === messages.length - 1}
      />
    ),
    [chatTheme, layoutDensity, messages.length, throttleOptions],
  );

  const listContentContainerStyle = useMemo(
    () => [
      {
        paddingTop: chatTheme.listPaddingTop ?? chatTheme.listPadding,
        paddingBottom: chatTheme.listPaddingBottom ?? chatTheme.listPadding,
        paddingHorizontal:
          chatTheme.listPaddingHorizontal ?? chatTheme.listPadding,
        flexGrow: 1,
      },
      contentContainerStyle,
    ],
    [chatTheme, contentContainerStyle],
  );

  useEffect(() => {
    if (!autoScrollToBottom || messages.length === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 0);
    return () => clearTimeout(t);
  }, [autoScrollToBottom, messages.length, lastContent, lastId]);

  return (
    <FlatList
      ref={listRef}
      testID={testID}
      data={messages}
      extraData={listExtraData}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      {...webClassName('agentui-message-list')}
      style={[
        style,
        Platform.OS === 'web'
          ? { flex: 1, minHeight: 0, width: '100%' }
          : null,
      ]}
      contentContainerStyle={listContentContainerStyle}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={onContentSizeChange}
      removeClippedSubviews={false}
      windowSize={7}
    />
  );
}

function keyExtractor(item: ChatMessage) {
  return item.id;
}
