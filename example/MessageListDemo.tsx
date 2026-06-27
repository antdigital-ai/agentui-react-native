import React, { useRef, useState } from 'react';
import { Button, View } from 'react-native';
import {
  MarkdownThemeProvider,
  MessageList,
  type ChatMessage,
} from '@antdigital/agentui-react-native';
import { demoStyles } from './demoStyles';
import {
  FIGMA_HOME_ASSISTANT_MARKDOWN,
  FIGMA_HOME_USER_MESSAGE,
} from './figmaHomeDemoContent';

const INITIAL: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: FIGMA_HOME_USER_MESSAGE,
  },
  {
    id: '2',
    role: 'assistant',
    content: FIGMA_HOME_ASSISTANT_MARKDOWN,
    isFinished: true,
  },
];

const STREAM_REPLY = FIGMA_HOME_ASSISTANT_MARKDOWN;

export function MessageListDemoScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const streamIdRef = useRef('stream-1');

  const appendStreamingReply = () => {
    const id = streamIdRef.current;
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== id),
      {
        id,
        role: 'assistant',
        content: '',
        streaming: true,
        isFinished: false,
      },
    ]);

    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      if (i >= STREAM_REPLY.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  content: STREAM_REPLY,
                  streaming: false,
                  isFinished: true,
                }
              : m,
          ),
        );
        clearInterval(timer);
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: STREAM_REPLY.slice(0, i) } : m,
        ),
      );
    }, 50);
  };

  const resetChat = () => {
    streamIdRef.current = `stream-${Date.now()}`;
    setMessages(INITIAL);
  };

  return (
    <MarkdownThemeProvider>
      <View style={demoStyles.content}>
        <View style={demoStyles.actionBar}>
          <Button title="Stream reply" onPress={appendStreamingReply} />
          <Button title="Reset" onPress={resetChat} />
        </View>
        <MessageList
          style={demoStyles.content}
          messages={messages}
          layoutDensity="compact"
          throttleOptions={{ enabled: true }}
        />
      </View>
    </MarkdownThemeProvider>
  );
}
