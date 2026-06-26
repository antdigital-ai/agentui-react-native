import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import type { MarkdownTheme } from '../theme/defaultTheme';
import type { MessageBubbleProps } from './types';

export function MessageBubble({
  message,
  chatTheme,
  throttleOptions,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const bubbleStyle = useMemo(
    () => ({
      maxWidth: chatTheme.bubbleMaxWidth,
      padding: chatTheme.bubblePadding,
      borderRadius: chatTheme.bubbleRadius,
      backgroundColor: isUser
        ? chatTheme.userBubbleBackground
        : chatTheme.assistantBubbleBackground,
    }),
    [chatTheme, isUser],
  );

  const markdownTheme = useMemo((): Partial<MarkdownTheme> | undefined => {
    if (!isUser) return undefined;
    return {
      colors: {
        text: '#ffffff',
        textMuted: 'rgba(255,255,255,0.75)',
        link: '#e6f4ff',
        codeBackground: 'rgba(255,255,255,0.15)',
        codeText: '#ffffff',
        blockquoteBorder: 'rgba(255,255,255,0.3)',
        blockquoteBackground: 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.2)',
        tableHeaderBackground: 'rgba(255,255,255,0.1)',
        taskCheckboxBorder: 'rgba(255,255,255,0.5)',
        hr: 'rgba(255,255,255,0.25)',
        errorBackground: '#fff2f0',
        errorBorder: '#ffccc7',
      },
    };
  }, [isUser]);

  return (
    <View
      testID={isUser ? 'message-bubble-user' : 'message-bubble-assistant'}
      style={{
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: chatTheme.bubbleGap,
      }}
    >
      <View style={bubbleStyle}>
        <MarkdownRenderer
          content={message.content}
          streaming={message.streaming}
          isFinished={message.isFinished}
          throttleOptions={throttleOptions}
          theme={markdownTheme}
        />
      </View>
    </View>
  );
}
