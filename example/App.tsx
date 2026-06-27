import React, { useState } from 'react';
import { Button, SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { demoStyles } from './demoStyles';
import { MessageListDemoScreen } from './MessageListDemo';
import { StreamingDemoScreen } from './StreamingDemo';
import { DeepThinkingDemoScreen } from './DeepThinkingDemo';

type DemoMode = 'messageList' | 'deepThinking' | 'streaming';

export default function App() {
  const [mode, setMode] = useState<DemoMode>('messageList');

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView style={demoStyles.root}>
        <View style={demoStyles.appShell}>
          <View style={demoStyles.toolbar}>
            <Button
              title="MessageList"
              onPress={() => setMode('messageList')}
            />
            <Button
              title="Deep thinking"
              onPress={() => setMode('deepThinking')}
            />
            <Button
              title="Streaming only"
              onPress={() => setMode('streaming')}
            />
          </View>
          <View style={demoStyles.content}>
            {mode === 'messageList' ? (
              <MessageListDemoScreen />
            ) : mode === 'deepThinking' ? (
              <DeepThinkingDemoScreen />
            ) : (
              <StreamingDemoScreen />
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
