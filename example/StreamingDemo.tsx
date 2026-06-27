/**
 * Debug screen: run from `example/` via `npm start` (Expo + Metro).
 * Simulates SSE-style streaming with character throttle + block-level parsing.
 */
import React, { useRef, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import {
  MarkdownRenderer,
  MarkdownThemeProvider,
} from '@antdigital/agentui-react-native';
import { demoStyles } from './demoStyles';
import { FIGMA_HOME_ASSISTANT_MARKDOWN } from './figmaHomeDemoContent';

const SAMPLE = FIGMA_HOME_ASSISTANT_MARKDOWN;

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
      <View style={demoStyles.content}>
        <View style={demoStyles.actionBar}>
          <Button title="Start streaming demo" onPress={startStream} />
        </View>
        <ScrollView
          style={demoStyles.content}
          contentContainerStyle={demoStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <MarkdownRenderer
            content={content}
            streaming={streaming}
            isFinished={finished}
            layoutDensity="compact"
            throttleOptions={{ enabled: true }}
          />
        </ScrollView>
        {!streaming && content.length > 0 ? (
          <Text style={demoStyles.footerHint}>Stream complete</Text>
        ) : null}
      </View>
    </MarkdownThemeProvider>
  );
}
