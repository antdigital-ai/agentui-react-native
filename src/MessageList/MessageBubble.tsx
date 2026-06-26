import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import type { MarkdownThemeOverride } from '../theme/defaultTheme';
import { agenticColors } from '../theme/agenticTokens';
import type { MessageBubbleProps } from './types';

export function MessageBubble({
  message,
  chatTheme,
  throttleOptions,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const bubbleStyle = useMemo(
    () => ({
      maxWidth: isUser
        ? chatTheme.userBubbleMaxWidth
        : chatTheme.assistantBubbleMaxWidth,
      padding: chatTheme.bubblePadding,
      backgroundColor: isUser
        ? chatTheme.userBubbleBackground
        : chatTheme.assistantBubbleBackground,
      ...(isUser
        ? {
            borderTopLeftRadius: chatTheme.bubbleRadius,
            borderTopRightRadius: chatTheme.bubbleRadius,
            borderBottomRightRadius: 2,
            borderBottomLeftRadius: chatTheme.bubbleRadius,
          }
        : { borderRadius: chatTheme.bubbleRadius }),
      ...(Platform.OS === 'web' && !isUser
        ? {
            boxShadow: '0 1px 2px rgba(20, 22, 28, 0.06)',
          }
        : null),
    }),
    [chatTheme, isUser],
  );

  const markdownTheme = useMemo((): MarkdownThemeOverride | undefined => {
    if (!isUser) return undefined;
    return {
      colors: {
        codeBackground: agenticColors.userBubbleCodeBackground,
        blockquoteBorder: agenticColors.primary,
        hr: agenticColors.userBubbleHr,
        linkUnderline: agenticColors.userBubbleLinkUnderline,
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
