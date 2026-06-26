import React, { useRef, useState } from 'react';
import { Button, View } from 'react-native';
import {
  MarkdownThemeProvider,
  MessageList,
  type ChatMessage,
} from '@antdigital/agentui-react-native';

const INITIAL: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '用 Markdown 介绍一下 React Native',
  },
  {
    id: '2',
    role: 'assistant',
    content: '## React Native\n\n- 跨平台\n- 使用 **JavaScript** 与原生 UI',
    isFinished: true,
  },
];

const STREAM_REPLY = `# 回复

流式输出示例：

1. 第一点
2. 第二点

\`\`\`ts
const x = 1;
\`\`\`
`;

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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', gap: 8, padding: 8 }}>
          <Button title="Stream reply" onPress={appendStreamingReply} />
          <Button title="Reset" onPress={resetChat} />
        </View>
        <MessageList
          style={{ flex: 1 }}
          messages={messages}
          throttleOptions={{ enabled: true }}
        />
      </View>
    </MarkdownThemeProvider>
  );
}
