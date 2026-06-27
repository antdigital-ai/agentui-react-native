import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { DeepThinking } from '../DeepThinking/DeepThinking';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import type { MarkdownThemeOverride } from '../theme/defaultTheme';
import { agenticColors } from '../theme/agenticTokens';
import { webClassName } from '../theme/webClassName';
import type { MessageBubbleProps } from './types';

export function MessageBubble({
  message,
  chatTheme,
  throttleOptions,
  layoutDensity = 'auto',
  isLast = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const figma = agenticColors.figmaHome;
  const assistantPadding =
    chatTheme.assistantBubblePadding ?? chatTheme.bubblePadding;
  const isTransparentAssistant =
    chatTheme.assistantBubbleBackground === 'transparent';

  const bubbleStyle = useMemo(
    () => ({
      maxWidth: isUser
        ? chatTheme.userBubbleMaxWidth
        : chatTheme.assistantBubbleMaxWidth,
      padding: isUser ? chatTheme.bubblePadding : assistantPadding,
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
      ...(Platform.OS === 'web' && !isUser && !isTransparentAssistant
        ? {
            boxShadow: '0 1px 2px rgba(20, 22, 28, 0.06)',
          }
        : null),
    }),
    [assistantPadding, chatTheme, isTransparentAssistant, isUser],
  );

  const markdownTheme = useMemo((): MarkdownThemeOverride | undefined => {
    if (!isUser) return undefined;
    const bubbleTextSpacing: MarkdownThemeOverride = {
      spacing: {
        leadingParagraphGap: 0,
        paragraphGap: 0,
      },
    };
    const onFigmaPurple =
      chatTheme.userBubbleBackground === figma.userBubbleBackground;
    if (onFigmaPurple) {
      return {
        ...bubbleTextSpacing,
        colors: {
          codeBackground: figma.userBubbleCodeBackground,
          blockquoteBorder: figma.userBubbleBorderAccent,
          hr: figma.userBubbleHr,
          linkUnderline: figma.userBubbleLinkUnderline,
        },
      };
    }
    return {
      ...bubbleTextSpacing,
      colors: {
        codeBackground: agenticColors.userBubbleCodeBackground,
        blockquoteBorder: agenticColors.primary,
        hr: agenticColors.userBubbleHr,
        linkUnderline: agenticColors.userBubbleLinkUnderline,
      },
    };
  }, [chatTheme.userBubbleBackground, figma, isUser]);

  return (
    <View
      testID={isUser ? 'message-bubble-user' : 'message-bubble-assistant'}
      {...webClassName('agentui-message-bubble')}
      style={{
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: isLast ? 0 : chatTheme.bubbleGap,
        width: isUser ? undefined : '100%',
      }}
    >
      <View style={[bubbleStyle, !isUser ? { width: '100%' as const } : null]}>
        {!isUser && message.thinking ? (
          <DeepThinking
            status={message.thinking.status}
            label={message.thinking.label}
            body={message.thinking.body}
            expandable={message.thinking.expandable}
            defaultExpanded={message.thinking.defaultExpanded}
            labels={message.thinking.labels}
            layoutDensity={layoutDensity}
            showExpandChevron={message.thinking.showExpandChevron}
            testID="message-deep-thinking"
          />
        ) : null}
        <MarkdownRenderer
          content={message.content}
          streaming={message.streaming}
          isFinished={message.isFinished}
          throttleOptions={throttleOptions}
          theme={markdownTheme}
          layoutDensity={layoutDensity}
        />
      </View>
    </View>
  );
}
