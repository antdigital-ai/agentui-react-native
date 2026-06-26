/**
 * Debug screen: run from `example/` via `npm start` (Expo + Metro).
 * Simulates SSE-style streaming with character throttle + block-level parsing.
 */
import React, { useRef, useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';
import {
  MarkdownRenderer,
  MarkdownThemeProvider,
} from '@antdigital/agentui-react-native';

const SAMPLE = `# Agent reply

Here is **bold**, *italic*, and ~~strike~~.

- Item one
- Item two

1. First
2. Second

\`\`\`javascript
function hello() {
  console.log('streaming');
}
\`\`\`

| Col A | Col B |
| ----- | ----- |
| 1     | 2     |

> A quote line
`;

export function StreamingDemoScreen() {
  const [content, setContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearStreamTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startStream = () => {
    clearStreamTimer();
    setContent('');
    setFinished(false);
    setStreaming(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 3;
      if (i >= SAMPLE.length) {
        setContent(SAMPLE);
        setFinished(true);
        setStreaming(false);
        clearStreamTimer();
        return;
      }
      setContent(SAMPLE.slice(0, i));
    }, 40);
  };

  React.useEffect(() => () => clearStreamTimer(), []);

  return (
    <MarkdownThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Button title="Start streaming demo" onPress={startStream} />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <MarkdownRenderer
            content={content}
            streaming={streaming}
            isFinished={finished}
            throttleOptions={{ enabled: true }}
          />
        </ScrollView>
        {!streaming && content.length > 0 ? (
          <Text style={{ padding: 8, opacity: 0.6, textAlign: 'center' }}>
            Stream complete
          </Text>
        ) : null}
      </SafeAreaView>
    </MarkdownThemeProvider>
  );
}
